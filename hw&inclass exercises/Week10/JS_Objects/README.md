# Self-Guided Lesson: Introduction to JavaScript Objects & Basic Methods

Please read the lesson below and complete all of the exercises on your own. This lesson is designed to only take about an hour. This will be considered your HW for Week10, and is an important topic to understand before we jump into making API requests on Thursday. If you do not at least read through this lesson, you risk falling behind in next class's lesson!

---

## Before You Start

Create a new file in VS Code called `index.html`. All of your JavaScript will live inside a `<script>` tag in this file. You'll check your output in the **browser's Developer Console**.

**Your starter file should look like this:**

```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <title>JS Objects Lesson</title>
  </head>
  <body>
    <h1>Open the Console to see your output!</h1>

    <script>
      // Your JavaScript goes here
    </script>
  </body>
</html>
```

Write all your JavaScript between the `<script>` and `</script>` tags. Save the file, then open it in your browser to run it.

> 💡 **Opening the Console:** After opening `index.html` in your browser, press **F12** (Windows) or **Cmd + Option + J** (Mac) to open Developer Tools, then click the **Console** tab. This is where your `console.log()` output will appear.

> 💡 **Refreshing:** Every time you save a change in VS Code, refresh the browser page (**F5** or **Cmd + R**) to re-run your script and see updated output in the Console.

---

## Learning Goals

By the end of this lesson, you'll be able to:

- [ ] Explain what a JavaScript object is and why it's useful
- [ ] Create an object using object literal syntax
- [ ] Access and modify properties using dot and bracket notation
- [ ] Add and delete properties from an object
- [ ] Write a method inside an object
- [ ] Use `Object.keys()`, `Object.values()`, and `Object.entries()`

Check each one off as you go!

---

## Section 1 — Why Objects? (5 min)

Imagine you want to store information about a person in code. A first attempt might look like this:

```js
let name = "Alex";
let age = 22;
let isStudent = true;
```

This works, but there's a problem — these three variables have nothing connecting them. What if you had 10 people to track? You'd have 30 separate variables with no clear relationship between them.

**Objects solve this.** An object groups related data under a single name:

```js
const person = {
  name: "Alex",
  age: 22,
  isStudent: true,
};
```

Everything about Alex lives in one place. Clean, organized, and easy to work with.

---

## Section 2 — Creating an Object (8 min)

An object is a collection of **key-value pairs**. Each pair is called a **property**.

```js
const person = {
  name: "Alex", // key: "name", value: "Alex"
  age: 22, // key: "age",  value: 22
  isStudent: true, // key: "isStudent", value: true
};
```

**The rules:**

- Keys go on the left, values on the right, separated by a colon `:`
- Each property is separated by a comma `,`
- The whole object is wrapped in curly braces `{}`
- Values can be any data type: strings, numbers, booleans, arrays, even other objects

### ✏️ Try It

Copy this into the `<script>` tag in your `index.html`, save, and refresh your browser:

```js
const person = {
  name: "Alex",
  age: 22,
  isStudent: true,
};

console.log(person);
```

You should see the full object printed in the Console.

> 💡 **Hint:** If you see `{}` or an error, double-check your commas and curly braces. Every property except the last one needs a comma after it. Also make sure your code is inside the `<script>` tags.

---

## Section 3 — Accessing Properties (10 min)

Once you have an object, you'll want to read values from it. There are two ways.

### Dot Notation

The most common way. Use a dot followed by the key name:

```js
console.log(person.name); // Alex
console.log(person.age); // 22
```

### Bracket Notation

Use square brackets with the key as a string:

```js
console.log(person["name"]); // Alex
console.log(person["age"]); // 22
```

Bracket notation is especially useful when the key is stored in a variable:

```js
let myKey = "name";
console.log(person[myKey]); // Alex
```

> 💡 **When to use which?**
>
> - Use **dot notation** by default — it's shorter and easier to read.
> - Use **bracket notation** when the key is dynamic (stored in a variable) or when you're working with a key that has spaces (though it's best to avoid keys with spaces).

### ✏️ Try It

Add this to your `<script>` tag, save, and refresh:

```js
const movie = {
  title: "Inception",
  year: 2010,
  director: "Christopher Nolan",
};

// 1. Log the title using dot notation
console.log(movie.title);

// 2. Log the director using bracket notation
console.log(movie["director"]);

// 3. Store "year" in a variable, then use it to log the year
let field = "year";
console.log(movie[field]);
```

> 💡 **Expected output:**
>
> ```
> Inception
> Christopher Nolan
> 2010
> ```

---

## Section 4 — Modifying Objects (7 min)

Objects are **mutable** — you can change them after creation.

### Update a Property

```js
person.age = 23;
console.log(person.age); // 23
```

### Add a New Property

You can add properties that didn't exist when the object was created:

```js
person.city = "New York";
console.log(person.city); // New York
```

### Delete a Property

```js
delete person.isStudent;
console.log(person); // isStudent is no longer there
```

> 💡 **`const` doesn't mean frozen!** You declared `person` with `const`, but you can still change its properties. `const` only prevents you from _replacing_ the object entirely (e.g., `person = {}` would throw an error). The contents of the object are still free to change.

### ✏️ Try It

Add this to your `<script>` tag, save, and refresh:

```js
const car = {
  make: "Toyota",
  model: "Camry",
  year: 2020,
};

// 1. Update the year to 2024
car.year = 2024;

// 2. Add a color property set to any color you like
car.color = "blue";

// 3. Delete the model property
delete car.model;

// 4. Log the full object to see the result
console.log(car);
```

> 💡 **Expected shape of output in the Console:**
>
> ```js
> {make: 'Toyota', year: 2024, color: 'blue'}
> ```
>
> (model should be gone, color should be there, year should be 2024)

---

## Section 5 — Object Methods (10 min)

A **method** is a function stored as a property inside an object. You call it the same way you access any property — just add parentheses at the end.

```js
const calculator = {
  add: function (a, b) {
    return a + b;
  },
  subtract: function (a, b) {
    return a - b;
  },
};

console.log(calculator.add(5, 3)); // 8
console.log(calculator.subtract(10, 4)); // 6
```

### Shorthand Syntax

Modern JavaScript lets you write methods more cleanly:

```js
const calculator = {
  add(a, b) {
    return a + b;
  },
  subtract(a, b) {
    return a - b;
  },
};
```

Both styles work the same way — the shorthand is just less to type.

### A Peek at `this`

Inside a method, `this` refers to the object the method belongs to. It lets the method access the object's own properties:

```js
const person = {
  name: "Alex",
  greet() {
    console.log("Hi, I'm " + this.name);
  },
};

person.greet(); // Hi, I'm Alex
```

> 💡 **`this` is a big topic** — don't worry about fully understanding it yet. For now, just know that inside a method, `this` = the object. We'll explore it more in a future lesson.

### ✏️ Try It

```js
const dog = {
  name: "Biscuit",
  breed: "Beagle",
  bark() {
    console.log(this.name + " says: Woof!");
  },
};

// 1. Call bark()
dog.bark();

// 2. Add a method called "describe" that logs:
//    "Biscuit is a Beagle"
//    (use this.name and this.breed)
dog.describe = function () {
  console.log(this.name + " is a " + this.breed);
};

dog.describe();
```

> 💡 **Expected output:**
>
> ```
> Biscuit says: Woof!
> Biscuit is a Beagle
> ```

---

## Section 6 — Built-in Object Methods (8 min)

JavaScript has three built-in methods that are really useful when you want to inspect or loop through an object.

### `Object.keys(obj)` — get all the keys

```js
const person = { name: "Alex", age: 22, city: "NY" };

console.log(Object.keys(person));
// [ 'name', 'age', 'city' ]
```

### `Object.values(obj)` — get all the values

```js
console.log(Object.values(person));
// [ 'Alex', 22, 'NY' ]
```

### `Object.entries(obj)` — get key-value pairs as arrays

```js
console.log(Object.entries(person));
// [ [ 'name', 'Alex' ], [ 'age', 22 ], [ 'city', 'NY' ] ]
```

> 💡 **Why are these useful?** These methods return arrays, which means you can loop through them with `forEach`, `map`, and other array methods. This comes up constantly in real-world JavaScript — it's worth getting comfortable with all three.

### ✏️ Try It

```js
const laptop = {
  brand: "Apple",
  model: "MacBook Pro",
  ram: 16,
  storage: 512,
};

// 1. Log all the keys
console.log(Object.keys(laptop));

// 2. Log all the values
console.log(Object.values(laptop));

// 3. Log all key-value pairs
console.log(Object.entries(laptop));
```

> 💡 **Expected output:**
>
> ```
> [ 'brand', 'model', 'ram', 'storage' ]
> [ 'Apple', 'MacBook Pro', 16, 512 ]
> [ [ 'brand', 'Apple' ], [ 'model', 'MacBook Pro' ], [ 'ram', 16 ], [ 'storage', 512 ] ]
> ```

---

## Section 7 — Putting It All Together (8 min)

Now it's your turn to build something from scratch using everything you've learned.

### 🏗️ Exercise: Build a Book Object

Work through each step one at a time. Save and refresh after each step to check your output in the Console.

```js
// Step 1: Create an object called `book` with these properties:
//   - title        (string  — pick any book you like)
//   - author       (string)
//   - pages        (number)
//   - isAvailable  (boolean — set to true)

// Step 2: Log the title using dot notation.

// Step 3: Log the author using bracket notation.

// Step 4: Add a new property called `genre` (any genre you like).

// Step 5: Update isAvailable to false.

// Step 6: Add a method called `describe` that logs:
//   "Title by Author — X pages"
//   Use this.title, this.author, and this.pages

// Step 7: Call book.describe()

// Step 8: Use Object.keys() to log all the property names.
```

> 💡 **Hints if you're stuck:**
>
> - **Step 1:** Start with `const book = { ... }` and fill in the properties.
> - **Step 4:** You can add a property after the object is created: `book.genre = "..."`
> - **Step 6:** Add the method like this: `book.describe = function() { console.log(...) }`  
>   Or define it inside the original object using shorthand: `describe() { ... }`
> - **Step 8:** `Object.keys(book)` returns an array of all key names.

---

## Section 8 — Quick Reference (keep this handy!)

| What you want to do       | How to do it                       |
| ------------------------- | ---------------------------------- |
| Create an object          | `const obj = { key: value }`       |
| Read a property (dot)     | `obj.key`                          |
| Read a property (bracket) | `obj["key"]`                       |
| Read with a variable key  | `obj[variable]`                    |
| Update a property         | `obj.key = newValue`               |
| Add a new property        | `obj.newKey = value`               |
| Delete a property         | `delete obj.key`                   |
| Add a method              | `obj.doThing = function() { ... }` |
| Call a method             | `obj.doThing()`                    |
| Get all keys              | `Object.keys(obj)`                 |
| Get all values            | `Object.values(obj)`               |
| Get all key-value pairs   | `Object.entries(obj)`              |

---

## ✅ Lesson Complete — Check Your Goals

Go back to the Learning Goals at the top and check off everything you can now do. If any box is still unchecked, revisit that section before moving on.

---

## 🚀 Challenge (Optional)

Ready to go further? Try this:

Create a `library` object that has:

- A `books` property containing an **array** of at least 3 book objects (each with a `title` and `author`)
- A method called `listTitles()` that logs the title of every book

> 💡 **Hint:** Inside `listTitles()`, you can use `this.books` to access the array. Then loop through it with `forEach`.

---

## 📚 Further Reading

- [MDN — Working with Objects](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Working_with_objects)
- [MDN — Object.keys()](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Object/keys)
- [MDN — `this` keyword](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Operators/this)
