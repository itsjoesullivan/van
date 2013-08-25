#[doctor](https://chrome.google.com/webstore/detail/ilikdighfoieecgeiffoekahmpjoekii)
On-the-fly docco document generation.

##tl;dr

Install this Chrome extension to automatically parse docco-style source code
when it's on the screen--i.e. when visiting a page like
[this](https://raw.github.com/jashkenas/backbone/master/backbone.js).

Documentation solutions are not what they could be. Few projects have very
high-quality externally-facing documentaton, and documentation as an internal
development tool is a much sorrier state of affairs.

The two biggest areas of friction in documentation writing are:

1. No one wants to write documentation
2. No one wants extra build steps

##Enter Docco

_No one wants to write documentation_

[Docco](http://jashkenas.github.io/docco/) is an excellent documentation tool:
write markdown in comments in your code, run it through Docco, and you've got a
directory of html containing a good-looking view of that code and its documentation. 
This lets you write your code and documentation together.

But what to do with that directory? Particularly if this is _internal_
documentation, shoving it in your app's public static folder isn't gonna happen.

##Enter Doctor

_No one wants extra build steps_

Doctor lets you skip that build step by shoving Docco into the browser. 
As soon as you browse to a piece of Docco-friendly source code __doctor__ kicks
into gear, parses out the markdown, and renders the page as the html file docco
_would_ have spit out.

Why not [give doctor](https://chrome.google.com/webstore/detail/ilikdighfoieecgeiffoekahmpjoekii) a shot?
