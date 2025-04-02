# Supermarket Checkout System

## Design Decisions

The central challenge of this project was designing a system that could handle offers while accommodating frequently changing prices.  
Here's how this was addressed:

#### 1. Offer Entity Design

- Original offer formats (Apple for 30, 2 for 45) were transformed into percentage discounts (25% discount)
- Offers are stored as entities with discount information
- When a new price is published - an offer price for the offer quantity is calculated with the offer discount
- Then it rounded up to the nearest 0 or 5 to make offers look attractive

#### 2. Price Change Management Strategy

While the initial thought was to implement a websocket with an Observable stream of price updates,  
I reconsidered this approach based on real-world online and retail scenarios:

- In typical online and offline stores, prices don't change in real-time during a shopping session
- This isn't a trading platform where second price updates are critical
- I assume that price can change only once during one scanning session
- Backend verification of prices during checkout is necessary regardless of the frontend implementation

Based on these considerations, I implemented a more practical approach:
- The frontend maintains its own view state of prices during the shopping session
- The backend verifies the current prices during checkout
- If a price discrepancy is detected, the checkout fails and the page refreshes with updated prices

#### 3. Logic Reuse Between Frontend and Backend

I spent some time thinking about how to effectively manage the logic of applying discounts.  
We need it on the backend for sure, but also want it on the frontend to avoid unnecessary server calls every time a user scans an item.

So i decided:
- The complex part (calculating the actual offer price for a quantity with proper rounding) happens just once when we receive new prices
- The simpler part (summing up offers for specified quantities) is implemented on both frontend and backend

This way, the frontend can give immediate feedback during shopping without constant backend calls,  
but we still verify everything during checkout to make sure prices are correct.  
It's not the most DRY approach since some logic is duplicated, but it's a practical compromise between performance and accuracy.

## Project Structure

This is a multi-module Maven project consisting of:

- **Backend**: Spring Boot application with JPA entities and REST controllers.
- **Frontend**: Angular application with components for item display and cart management.
- **RabbitMQ Listener**: Processes price updates and triggers recalculations.

Additionally, the project includes:
- **Price Publisher**: A bash script (`docker/rabbitmq-publisher/script.sh`) that simulates price changes by:
  - Publishing random price values (44, 53, 66, or 78) to the RabbitMQ exchange
  - Sending updates at configurable intervals (controlled by PUBLISH_FREQUENCY environment variable)
  - Including an initial delay before the first message (controlled by INITIAL_DELAY)

## Quick Start

The project uses frontend-maven-plugin `com.github.eirslett` to automatically build and start the frontend along with the backend.  
To start the entire application, simply run:

```bash
docker-compose up --build
```

The application will be available at:
- Frontend: http://localhost:8080
- Backend API: http://localhost:8080/api
- RabbitMQ Management: http://localhost:15672 (kn/kn)

## Future Improvements

1. Implement caching of frequently used data and rarely changed data (Offers are changed once a week according to the task).
2. I followed the naming conventions from the Task, but the word `Item` is very confusing, i'd prefer `Product`.
3. H2 is being used solely for the purpose of this assessment task. Of course we need the database and migrations.
4. Use openapi-maven-plugin to automatically generate .ts types and api services, and also provide swagger documentation.
5. Follow Dependency Inversion principle, extract interfaces for Service layer, and for Controller layer with OpenAPI annotations.
6. We need more validation.
7. Logging/monitoring. 
8. Security, authentication/authorisation.
9. Do not use hardcoded credentials, of course.
10. Use pre-built image for rabbitmq-publisher in the real project, instead of local build context.
11. There are also some TODOs in the code.
