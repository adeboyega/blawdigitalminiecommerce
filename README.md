Overview

Whazzonline is a website where people can buy things online. It is made to work and handle a lot of users. This project is about making the basic shopping experience good. This includes looking at products seeing product details and using a cart.

# What I Used To Build It

Frontend: Next.js 14 (App Router) utilizing Server-Side Rendering (SSR) for SEO and performance.  

Styling: Tailwind CSS for a utility-first, highly responsive design.  Language: TypeScript to ensure type safety and maintainable code.

Backend & Database: Supabase (PostgreSQL) for secure data persistence and authentication. 

State Management: Zustand for lightweight, scalable cart state management.  

DevOps: Docker for environment parity and simplified local development.

---

# How The Project Is Organized

i made parts that can be used times.

i kept the website. Backend separate.

i made a layer for talking to Supabase.

i made the images load when needed to make it faster.

---

# How To Get Started

## What You Need First

You need Node.js 18 or newer.

You need Docker Desktop if you want to use it.

## How To Install

First get the code:

```bash

git clone https://github.com/adeboyega/blawdigitalminiecommerce.git

cd blawdigitalminiecommerce

```

Then get all the dependencies:

```bash

npm install

```

Make a file called `.env.local`:

```bash

NEXT_PUBLIC_SUPABASE_URL=Supabase_URL

NEXT_PUBLIC_SUPABASE_ANON_KEY=Supabase_KEY

```

Now you can start the website:

```bash

npm run dev

```

Or you can use Docker:

```bash

docker-compose up


# What i Did Not Do

I   only did the shopping experience.

If you are not logged in your cart is stored on your computer.

I did not finish the payment part yet.


# What We Will Do Next

I will add paystack and flutterwave to handle payments.

I will test everything to make sure it works.

I will make a library of parts that can be used times.

We will make the inventory management better.


More Information

You can find documents in the `/docs` folder:

What i needed to do it

How the backend works

How the app works

Notes, on the user experience

How I developed it