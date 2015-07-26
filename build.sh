#!/bin/bash

for MEDIUM_POST in `ls test/medium_posts/`; do
  SLUG=`echo $MEDIUM_POST | sed 's/.json//g'`
  echo "mediumexporter ./test/medium_posts/${SLUG}.json > examples/${SLUG}.md"
  #mediumexporter ./test/medium_posts/${SLUG}.json > examples/${SLUG}.md
  sleep 1;
done;
