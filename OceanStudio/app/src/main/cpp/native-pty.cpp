#include <jni.h>
#include <string>
#include <unistd.h>
#include <pty.h>
#include <termios.h>
#include <sys/ioctl.h>
#include <sys/wait.h>
#include <fcntl.h>
#include <stdlib.h>
#include <android/log.h>

#define LOG_TAG "NativePTY"
#define LOGI(...) __android_log_print(ANDROID_LOG_INFO, LOG_TAG, __VA_ARGS__)
#define LOGE(...) __android_log_print(ANDROID_LOG_ERROR, LOG_TAG, __VA_ARGS__)

extern "C" {

JNIEXPORT jint JNICALL
Java_com_ocean_terminal_NativePTY_createSubprocess(
        JNIEnv *env,
        jobject thiz,
        jstring cmd,
        jstring cwd,
        jobjectArray envVars,
        jintArray processIdArray) {

    const char *cmd_str = env->GetStringUTFChars(cmd, nullptr);
    const char *cwd_str = env->GetStringUTFChars(cwd, nullptr);

    int master_fd;
    pid_t pid = forkpty(&master_fd, nullptr, nullptr, nullptr);

    if (pid < 0) {
        LOGE("forkpty failed");
        env->ReleaseStringUTFChars(cmd, cmd_str);
        env->ReleaseStringUTFChars(cwd, cwd_str);
        return -1;
    }

    if (pid == 0) {
        // Child Process
        if (cwd_str && strlen(cwd_str) > 0) {
            chdir(cwd_str);
        }

        // Set environment variables
        if (envVars != nullptr) {
            jsize envLen = env->GetArrayLength(envVars);
            for (int i = 0; i < envLen; i++) {
                jstring envStr = (jstring) env->GetObjectArrayElement(envVars, i);
                const char *env_c = env->GetStringUTFChars(envStr, nullptr);
                putenv(strdup(env_c));
                env->ReleaseStringUTFChars(envStr, env_c);
            }
        }

        char *const args[] = {strdup(cmd_str), nullptr};
        execvp(cmd_str, args);
        LOGE("execvp failed for %s", cmd_str);
        exit(1);
    }

    // Parent Process
    env->ReleaseStringUTFChars(cmd, cmd_str);
    env->ReleaseStringUTFChars(cwd, cwd_str);

    if (processIdArray != nullptr && env->GetArrayLength(processIdArray) > 0) {
        jint pid_int = (jint) pid;
        env->SetIntArrayRegion(processIdArray, 0, 1, &pid_int);
    }

    return master_fd;
}

JNIEXPORT void JNICALL
Java_com_ocean_terminal_NativePTY_setWindowSize(
        JNIEnv *env,
        jobject thiz,
        jint fd,
        jint rows,
        jint cols,
        jint widthPx,
        jint heightPx) {

    struct winsize ws;
    ws.ws_row = (unsigned short) rows;
    ws.ws_col = (unsigned short) cols;
    ws.ws_xpixel = (unsigned short) widthPx;
    ws.ws_ypixel = (unsigned short) heightPx;

    ioctl(fd, TIOCSWINSZ, &ws);
}

JNIEXPORT void JNICALL
Java_com_ocean_terminal_NativePTY_closePty(
        JNIEnv *env,
        jobject thiz,
        jint fd) {
    if (fd >= 0) {
        close(fd);
    }
}

JNIEXPORT jint JNICALL
Java_com_ocean_terminal_NativePTY_waitForProcess(
        JNIEnv *env,
        jobject thiz,
        jint pid) {
    int status;
    waitpid((pid_t) pid, &status, 0);
    if (WIFEXITED(status)) {
        return WEXITSTATUS(status);
    }
    return -1;
}

}
