cmake_minimum_required(VERSION 3.22.1)

project("oceanpty")

add_library(
        oceanpty
        SHARED
        native-pty.cpp)

find_library(
        log-lib
        log)

find_library(
        util-lib
        util)

target_link_libraries(
        oceanpty
        ${log-lib}
        ${util-lib})
