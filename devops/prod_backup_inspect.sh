#!/bin/bash
docker inspect -f "{{ index .Volumes \"/mnt/backup\" }}" prod_backup
