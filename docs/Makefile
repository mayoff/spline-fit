

all: quadratic.html cubic-unconstrained.html cubic-half-constrained.html

%.html: %.md prefix.html
	cat prefix.html > $@.new
	Markdown.pl $< >> $@.new
	mv $@.new $@
