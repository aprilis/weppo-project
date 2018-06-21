#include <sys/time.h>
#include <sys/resource.h>
#include <stdlib.h>
#include <unistd.h>
#include <stdio.h>

int main(int argc, char *argv[], char *envp[])
{
    if(argc < 3) {
        printf("Path and memory limit are required\n");
        return 1;
    }
    char *path = argv[2];
    int memory = atoi(argv[1]);
    struct rlimit limit;
    limit.rlim_cur = limit.rlim_max = memory;
    setrlimit(RLIMIT_AS, &limit);
    if(execve(path, argv + 2, envp) == -1) {
        perror("Execve error");
    }
}