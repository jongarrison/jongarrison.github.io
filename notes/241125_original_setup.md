
11/25/24 - New profile setup with copilot help

    brew update

    brew install hugo

I then wiped out the contents of my old jongarrison repo and created a stub site inside that directory with:

    hugo new site jongarrison

I then mv'd all of the contents up to the root of the project.

I then forked the excellent hugo-profile project and git submoduled it:

    git submodule add git@github.com:jongarrison/hugo-profile.git themes/hugo-profile

delete the hugo.toml file (this will be replaced with config.yaml in the next step)

cp -r themes/hugo-profile/exampleSite/* .

Configure the config.yaml file to have the settings you want (title, etc) at the top of the file

    hugo server

open http://localhost:1313

And proceed with customizing:

* config.yaml: Update site settings such as title, description, and other parameters.
* content: Add or modify content files like blog posts and pages.
* layouts: Customize the layout and design of your site.
* static: Add or update static assets like images, CSS, and JavaScript files.


HUGO > Pages deployment

* I tried using copilot unsuccessfully to do the Pages deployment. In the end, I read some stuff online and Github.com > Actions > "New Workflow" button > Searched on "hugo"
* The repository had an old setup to do a Jekyll build. I added, with copilot's help a file to disable jekyll building
* The repository also had an old setting related to Pages that needed to be changed. Github.com > Settings > Pages > Build and Deployment > Set to "Github Actions"
* removed the .github > workflows > gh-pages.yml file that copilot had me add.



