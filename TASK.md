# Coding Kata

All technical interviews taken with _Haiilo_ will be performed in the same manner, in order to minimise variance in the recruitment process. This should ensure the interview process is fair to the candidates, and also that _Haiilo_ do not miss opportunities to hire good candidates.

The interview exercise that we will use during in person technical interviews is the "Checkout Kata", which is described below, with annotations. The wording of the kata has been carefully crafted to provide a specific set of challenges and crutches to a candidate.

## The Excercise:

### Implement the code for a supermarket checkout that calculates the total price of a number of items.

### Items each have their own price, which can change frequently.

### There are also weekly special offers for when multiple items are bought.

### An example of this would be "Apples are 50 each or 3 for 130".

### The pricing table example:

| Item   |Price for 1 item | Offer                |
|--------|-----------------|----------------------|
| Apple  | 30              | 2 for 45             |
| Banana | 50              | 3 for 130            |
| Peach  | 60              |  -                   |
| Kiwi   | 20              |  -                   |

The checkout accepts the items in any order, so that if we scan an apple, a banana and another apple, we'll recognise two apples and apply the discount of 2 for 45.

Please work as you would do in your usual job. We don't accept one single commit. We want to see the steps you would do usually.
