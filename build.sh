#!/bin/bash

for MEDIUM_POST in `ls test/medium_posts/`; do
  SLUG=`echo $MEDIUM_POST | sed 's/.json//g'`
  echo "mediumexporter --headers ./test/medium_posts/${SLUG}.json > examples/${SLUG}.md"
  mediumexporter --headers ./test/medium_posts/${SLUG}.json > examples/${SLUG}.md
done;
