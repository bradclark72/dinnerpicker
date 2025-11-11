'use server';

/**
 * @fileOverview AI-powered restaurant ranking flow.
 *
 * This file defines a Genkit flow that ranks restaurants based on reviews, price, popularity, and user preferences.
 *
 * @exports {
 *   rankRestaurants,
 *   RankRestaurantsInput,
 *   RankRestaurantsOutput
 * }
 */

import {ai} from '@/ai/genkit';
import {z} from 'genkit';

// Define the input schema
const RankRestaurantsInputSchema = z.object({
  restaurants: z.array(
    z.object({
      name: z.string(),
      address: z.string(),
      rating: z.number().optional(),
      priceLevel: z.number().optional(),
      userRatingsTotal: z.number().optional(),
      cuisine: z.string().optional(),
    })
  ).describe('An array of restaurant objects to rank.'),
  userPreferences: z.object({
    cuisine: z.string().optional(),
    maxPriceLevel: z.number().optional().describe('Maximum acceptable price level (1-4).'),
  }).optional().describe('The user preferences'),
});

export type RankRestaurantsInput = z.infer<typeof RankRestaurantsInputSchema>;

// Define the output schema
const RankRestaurantsOutputSchema = z.array(
  z.object({
    name: z.string(),
    address: z.string(),
    rating: z.number().optional(),
    priceLevel: z.number().optional(),
    userRatingsTotal: z.number().optional(),
    cuisine: z.string().optional(),
    rank: z.number().describe('The rank of the restaurant, with 1 being the highest.'),
  })
);

export type RankRestaurantsOutput = z.infer<typeof RankRestaurantsOutputSchema>;

// Define the main function
export async function rankRestaurants(input: RankRestaurantsInput): Promise<RankRestaurantsOutput> {
  return rankRestaurantsFlow(input);
}

// Define the prompt
const rankRestaurantsPrompt = ai.definePrompt({
  name: 'rankRestaurantsPrompt',
  input: {schema: RankRestaurantsInputSchema},
  output: {schema: RankRestaurantsOutputSchema},
  prompt: `You are an AI restaurant ranking expert. Given a list of restaurants and user preferences, rank the restaurants based on how well they match the user's needs. Restaurants should be returned as a list, in order of ranking (highest ranked first) and should include a rank number (1 being the highest).

  Here are the restaurants:
  {{#each restaurants}}
  - Name: {{name}}, Address: {{address}}, Rating: {{rating}}, Price Level: {{priceLevel}}, Number of User Ratings: {{userRatingsTotal}}, Cuisine: {{cuisine}}
  {{/each}}

  {% raw %}{{!-- Handlebars: display user preferences only if they exist --}}{% endraw %}
  {{#if userPreferences}}
  Here are the user preferences:
  - Cuisine: {{userPreferences.cuisine}}
  - Max Price Level: {{userPreferences.maxPriceLevel}}
  {{/if}}

  Rank the restaurants and include a rank parameter in the output.
  The output should be a JSON array of restaurant objects, each including all the original fields, and an added "rank" field. Do not exclude any restaurants from the list.  The restaurants should be in order of rank.  The "rank" field should be a number, with 1 being the highest rank.
  The cuisine should be strongly considered.  The closer the user preferences are met, the higher the rank should be.
  Rating, user rating totals and price level should also be factored in the rank.
  `,
});

// Define the flow
const rankRestaurantsFlow = ai.defineFlow(
  {
    name: 'rankRestaurantsFlow',
    inputSchema: RankRestaurantsInputSchema,
    outputSchema: RankRestaurantsOutputSchema,
  },
  async input => {
    const {output} = await rankRestaurantsPrompt(input);
    return output!;
  }
);
