
11/25/24 - New profile setup with copilot help

    brew update

    brew install hugo

I then wiped out the contents of my old jongarrison repo and created a stub site inside that directory with:

    hugo new site jongarrison

I then mv'd all of the contents up to the root of the project.

I then forked the excllent hugo-profile project and git submoduled it:

    git submodule add git@github.com:jongarrison/hugo-profile.git themes/hugo-profile

Configure the Theme: Open the config.toml file in your Hugo site directory and set the theme:

