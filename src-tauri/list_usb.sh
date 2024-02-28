#!/bin/bash

for port in /dev/tty.usbmodem*; do
    echo $port
done
