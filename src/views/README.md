# Views

All view templates are stored here. They are simple .html files with handlebars syntax. Handlebars is the template engine for this app.

Read more at http://handlebarsjs.com/

## Example structure

- `/views` - contains all templates
	- `/someArea` - specific to a controller or app area
		- `show.html`
		- `list.html`
		- `form.html`
		- `delete.html`
	- `/someOtherArea`
		- `show.html`
		- `add.html`
	- `/partials` - reusable mini-templates
		- `header.html`
		- `footer.html`
	- `layout.html` - the main layout/decorator/master template