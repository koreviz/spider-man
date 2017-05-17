##
# Kore Make
# Copyright(c) 2013 Koreviz
# MIT Licensed
##
SHELL := /bin/bash

APP = spider-man
VERSION = v1.0.0
REPO = koreviz/$(APP)
STYL = $(shell find node_modules -name "styl" -type f)
STYLE = app
UGLIFYJS = $(shell find node_modules -name "uglifyjs" -type f)
VENDOR = moz,webkit

all: configure compile
	
clean:
	rm -f core.json
	rm -fR {build,components,node_modules,tmp,var}
	rm -f public/*{.css,.js,.html}

configure:
	npm install
	mkdir -p tmp
	mkdir -p var/{lib,log,pid,run}
	mkdir -p var/lib/redis
	mkdir -p ./build

	component install

compile:
	$(foreach style,$(STYLE),$(STYL) -v $(VENDOR) < style/$(style).css > build/$(style).css;)
	component build; cp build/build.* public/

debug:
	$(foreach style,$(STYLE),$(STYL) -v $(VENDOR) < style/$(style).css > build/$(style).css;)
	component build; cp build/build.* public/

package:
	export COPYFILE_DISABLE=true; tar czvf ../$(APP)-$(VERSION).tar.gz History.md public Readme.md

push:
	rm -fR .git
	git init
	git add .
	git commit -m "Initial release"
	git remote add origin gh:$(REPO).git
	git push origin master

server:
	redis-server ./etc/redis.conf

shutdown:
	redis-cli SHUTDOWN