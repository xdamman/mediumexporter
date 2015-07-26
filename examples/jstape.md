url: https://medium.com/javascript-scene/why-i-use-tape-instead-of-mocha-so-should-you-6aa105d8eaf4
date: Wed Feb 11 2015 17:16:08 GMT-0200 (BRST)


#Why I use Tape
#Instead of Mocha &
#So Should You

##Measuring Software Quality

![](https://medium2.global.ssl.fastly.net/max/6016/1*d7mHlwL1eQ4n9ZZJzlF0HA.jpeg)

###Measuring Software Quality
> TL;DR: Mocha is a $150k Porsche Panamera when the best tool for the job is a $30k Tesla Model 3. Don’t waste your resources on testing bells and whistles. Invest them in creating your app, instead.

As many of you know, I maintain a popular project called the [Essential JavaScript Links collection](https://github.com/ericelliott/essential-javascript-links#essential-javascript-links) — a one stop shop to find the best JavaScript resources I know. Once in a while somebody will ask me why I don’t list their favorite thing, or the most popular thing.

Sometimes popularity is an indication of quality. Other times, popular things are popular for popularity’s sake, and not because they’re better than alternatives.

On real production projects, I have used Jasmine, Mocha, NodeUnit, Tape, and a bunch of other solutions. I have investigated *many other options.* For the last few years, I have used and continue to use [Tape](https://github.com/substack/tape) along with Supertest (for API testing) on all of my personal projects and projects that I lead.

###What are Unit tests?



Unit tests exist to test individual units of software functionality. A unit is a module, component, or function. They’re bits of the program that can work independently of the rest of the program. The presence of unit testing implies that the software is designed in a modular fashion. You may hear once in a while that there are ways to make software “more testable.”

If you find that it’s hard to write unit tests for your program without mocking lots of other things, that’s a sign that your program is not modular enough. Revealing tight coupling (the opposite of modularity) is one of the many important roles that unit tests play in software creation.

Every module should have unit tests, and every application should be made up of modules. In other words, if you’re not writing unit tests, you should be.

###What’s Wrong with Mocha, Jasmine, etc…?



1. **Too much configuration:** Choose an assertion library, chose a reporting library, chose a task runner (Grunt, Gulp, etc…) Then figure out how to translate the documentation examples to the reporting library / task runner you chose. All of this is too much cognitive load. *Vs: Choose Tape. Done.*

1. **Globals:** Mocha Jasmine, and several other alternatives pollute the global environment with functions like *`describe`*, *`it`*, etc… Some assertion libraries extend built-in prototypes. Aside from removing the self-documenting nature of simple module exports, those decisions could potentially conflict with the code you’re trying to test. *Vs: Tape’s simple module export.*

1. **Shared State:** Functions like *`beforeEach`* and *`afterEach`* actively encourage you to do something you **definitely should not do**: Share state between tests. *Vs. Tape: No such functions for global state sharing. Instead, call setup and teardown routines from individual tests, and **contain all state to local test variables.***



###Why Tape?

I won’t list Mocha in the Essential JavaScript Links because Mocha does way too much and gives developers way too many assertion choices, and that leads to [analysis paralysis](http://en.wikipedia.org/wiki/Analysis_paralysis) and lost productivity. Every time I have seen Mocha used on a project, I’ve seen developers dump way too much time in the testing framework and testing environment.

While I’m ranting I would be remiss if I didn’t mention that if you spend a lot of time on mocks and stubs, that’s a strong code-smell. You can probably dramatically simplify both your tests and your application by breaking your app into more modular chunks.
> #Mocking is a code smell.

A few simple mocks here and there are OK. Some of your app will inevitably involve side-effects (reading from or writing to the network or filesystem, for instance). When you do have a genuine need for mocks, keep them simple. Little more than basic stubs are ideal. But on many projects, I’ve seen a lot of over-complicated mocks that never needed to exist in the first place. Why maintain more code than you need to?

The more you break your problems down into simple, [pure](https://en.wikipedia.org/wiki/Pure_function) [functions](https://medium.com/javascript-scene/the-two-pillars-of-javascript-pt-2-functional-programming-a63aa53a41a4), the easier it will be to test your code *without mocks.*
> #Testing is not what you should
> #spend most of your time doing.

You should spend most of your time thinking about how to create the best, most flexible, most performant solutions given the afforded time constraints. Time is value in the software development world, and you shouldn’t waste one minute of it.

If you get your kicks burning money, use Mocha, Jasmine, Jest, etc… But if you value your time, keep reading.

With many BDD assertion libraries, there are getters with side effects. At one company I worked for (not naming names), that buried a bug in one of our tests, and we spent far too long debugging the test case rather than developing actual application code.
> #Test assertions should be dead simple,
> #& [completely free of magic](https://en.wikipedia.org/wiki/Magic_(programming)).

*`equal`*, *`deepEqual`*, *`pass`* & *`fail`* are my primary go-to assertions. If *`equal`* and *`deepEqual`* were the only assertions available anywhere, the testing world would probably be better off for it.

Why? *`equal`* & *`deepEqual`* provide quality information about expectations, and they lead to very concise test cases that are **easy to read & maintain.**

When you write a bug report, you should always *provide a description,* explain *what you expected to see*, and explain *what you actually saw*.

Test cases should be written in much the same way:

1. Describe the feature that you’re testing in plain English.

1. Provide the expected outcome of the test. This part is why many unit tests are called *expectations.*

1. Compare that to the *actual value.*

When a unit tests fails, *the error message is your bug report.*
> #Your test descriptions should be clear
> #enough to use as documentation.

<iframe src="https://medium.com/media/9d8e481812059cb5d76ec771194c2ecb" frameborder=0></iframe>



If you write tests this way, your test error messages should be clear enough to use as bug reports:

    TAP version 13
    # A passing test
    ok 1 This test will pass.
    # Assertions with tape.
    not ok 2 Given two mismatched values, .equal() should produce a nice bug report
      ---
        operator: equal
        expected: 'something to test'
        actual:   'sonething to test'
      ...

    1..2
    # tests 2
    # pass 1
    # fail 1
> #Your automated test error messages
> #are your bug reports.

Simple tests assertions provide:

* Better readability.

* Less code.

* Less maintenance.

These features trump all the bells and whistles in the world.

**No contest.**



###Testing tools should be modular



Some test frameworks (Mocha, Jest, etc…) provide more services than a simple test runner. They want to format your tests so they’re easy to read, or they’ll do your mocking for you automagically. (Remember what I said about magic in test suites?)

They try to be end-to-end test solutions. Speaking from the experience of porting a Mocha driven test framework from client-only tests to [universal JavaScript](https://leanpub.com/learn-javascript-react-nodejs-es6/) testing, believe me when I say: sometimes end-to-end can end badly.

Jest bills itself as a better end-to-end solution with automatic mocking of Node modules. You can probably imagine what I think of that.

Solutions like Mocha and Jasmine are harder to fit into your continuous integration pipeline than tape.

###TAP



TAP is the [Test Anything Protocol](https://en.wikipedia.org/wiki/Test_Anything_Protocol#History) that has been around since 1987. Almost every important automated testing tool supports TAP output. There are TAP processors that produce colored console reports, processors that make pretty, styled HTML, processors that can branch on results and trigger various hooks, and on and on…

You could think of Tape as a pure CLI tool that takes unit tests as input and produces TAP as output. Using standard Unix tools available on every Node platform, you can integrate tape with literally any tooling that can read from stdin and understand TAP output.

Remember that bland test output above? Here’s what it looks like:

![](https://medium2.global.ssl.fastly.net/max/4588/1*nMh82PZ4qSbqj1bEjDxTGQ.png)**



###Your turn!



Copy and paste the test code above and run the following commands in your terminal:

    npm install -g babel tape faucet browserify browser-run
    npm install --save-dev babelify tape
    babel-node test.js | faucet

Cool, huh?

But what if you want to run your tests in a browser? Try this:

    browserify -t babelify test.js | browser-run -p 2222

Pop open your browser and navigate to:

    http://localhost:2222

Don’t worry if you’re staring at a blank page. Switch back over to your console and take a look. You should see this:

    TAP version 13
    # A passing test
    ok 1 This test will pass.
    # Assertions with tape.
    not ok 2 Given two mismatched values, .equal() should produce a nice bug report
      ---
       operator: equal
       expected: ‘something to test’
        actual: ‘sonething to test’
       at: Test.assert (http://localhost:2222/bundle.js?87789b09:5195:17)
      ...

    1..2
    # tests 2
    # pass 1
    # fail 1

Look familiar? You can even pipe it through *`faucet`:*

    browserify -t babelify test.js | browser-run -p 2222 | faucet

![](https://medium2.global.ssl.fastly.net/max/5024/1*ngzfOQOLpjd9hodsdyv7-w.png)**



###Modularity > *



Mocha, Jasmine, Jest and the rest? Just say no to clutter. Simplify your life. Experience **testing zen.**

Do you really need an end-to-end solution that thinks *its way is the only way,* or do you want a solution that you can literally plug into any standard system workflow?

If you’re writing for 100% coverage (and you should be), your test suite is likely to be larger than your application. What if you decide you want to change your testing workflow tomorrow? How much of your test suite do you think you could port in a day?

I recently started using promises in my unit tests. I switched from Tape to Blue Tape, which is just a thin wrapper around tape to add promise support. I didn’t have to change a single unit test to make it work. I didn’t have to change anything in my testing and continuous delivery pipeline at all.

I few weeks ago I ported an entire app test suite from QUnit (jQuery test framework) to Tape. It took 5 minutes. On a recent job I moved a bunch of inline assertions from the live code into unit tests (which was a better place for these particular assertions). I literally copied, pasted and did one search & replace.

###Parallel Testing

Think you’ll miss automagic test parallelization? I keep tests for different modules in different files. It takes about five minutes to write a little wrapper that will fire up workers across all your machine cores and zip through them in parallel.



###Before/After/BeforeEach/AfterEach



You don’t need these. They’re bad for your test suite. Really. I have seen these abused to share global state far too often. *Try this, instead:*

<iframe src="https://medium.com/media/2ff2d08ed30f48c0113004615ea871fa" frameborder=0></iframe>



###Fewer features is the new feature-rich



Because tape is such a simple module with such simple features, it’s easy to extend it and fit it into many different workflows. For instance, take a look at the [Cloverfield prod-module-boilerplate](https://github.com/cloverfield-tools/prod-module-boilerplate) [package.json](https://github.com/cloverfield-tools/prod-module-boilerplate/blob/master/package.json).

*`blue-tape`* is just a simple wrapper around tape that adds promise support, so you can write tests like this:

<iframe src="https://medium.com/media/195eb21dc3f60e698cb607fbd1a366c3" frameborder=0></iframe>

It’s also a breeze to integrate all of this stuff with continuous integration services. We have the prod-module-boilerplate configured to validate our new package commits in both [Travis CI](https://travis-ci.org/cloverfield-tools/prod-module-boilerplate) and [CircleCI](https://circleci.com/gh/cloverfield-tools/prod-module-boilerplate/tree/master).

P.S. If you’re unit testing [React components](https://medium.com/javascript-scene/baby-s-first-reaction-2103348eccdd), use the [shallow renderer](http://simonsmith.io/unit-testing-react-components-without-a-dom/).

Do you want bells and whistles, or do you want flexibility? If you want your testing to just get out of your way and let you concentrate on building things…
> #**You can’t beat [Tape](https://github.com/substack/tape).**
> #[Learn JavaScript
> #Software Testing with Sauce Labs](https://ericelliottjs.com/product/learn-javascript-software-testing-with-sauce-labs/)

***Eric Elliott** is the author of [“Programming JavaScript Applications”](http://pjabook.com) (O’Reilly), host of the documentary film-in-production, **“Programming Literacy”**. He has contributed to software experiences for **Adobe Systems**, **Zumba Fitness**, **The Wall Street Journal**, **ESPN**, **BBC**, and top recording artists including **Usher**, **Frank Ocean**, **Metallica**, and many more.*

*He spends most of his time in the San Francisco Bay Area with the most beautiful woman in the world.*
