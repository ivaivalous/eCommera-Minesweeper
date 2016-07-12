# Middleware

Express.js defines Middleware as functions that modify the request and response objects. They are chained together one after the other and consecutively modify the data for each request/response in the app.

> Express is a routing and middleware web framework that has minimal functionality of its own: An Express application is essentially a series of middleware function calls.
> 
> Middleware functions are functions that have access to the `request` object (`req`), the `response` object (`res`), and the next middleware function in the application’s request-response cycle. The next middleware function is commonly denoted by a variable named `next`.
> 
> Middleware functions can perform the following tasks:
> 
> - Execute any code.
> - Make changes to the request and the response objects.
> - End the request-response cycle.
> - Call the next middleware function in the stack.
> 
> If the current middleware function does not end the request-response cycle, it must call `next()` to pass control to the next middleware function. Otherwise, the request will be left hanging.

The quote above is from https://expressjs.com/en/guide/using-middleware.html