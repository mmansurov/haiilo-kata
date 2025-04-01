#!/bin/bash

# Initial delay before starting to publish events
echo "Waiting for initial delay of ${INITIAL_DELAY} seconds..."
sleep ${INITIAL_DELAY}

while :
do
  # Generate a random price value from the options: 44, 53, 66 or 78
  PRICE_VALUES=(44 53 66 78)
  RANDOM_INDEX=$((RANDOM % 4))
  PRICE_VALUE=${PRICE_VALUES[$RANDOM_INDEX]}
  
  PRICE_DTO="{
      \"itemId\": 1,
      \"value\": $PRICE_VALUE
  }"
  echo $PRICE_DTO
	amqp-publish --server="${RABBITMQ_HOST}" --username="kn" --password="kn" --port=5672 --exchange="amq.fanout" --routing-key="price" --body="$PRICE_DTO"
	sleep ${PUBLISH_FREQUENCY}
done
