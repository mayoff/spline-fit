

all: quadratic.html cubic-unconstrained.html

%.html: %.md prefix.html
	cat prefix.html > $@.new
	Markdown.pl $< >> $@.new
	mv $@.new $@
