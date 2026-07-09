# Smart Grocery Assistant

An intelligent grocery list management application built with Angular 20 and Google Genkit AI. The application provides AI-powered smart suggestions for complementary grocery items, helping users plan their shopping more efficiently.

## Features

- **AI-Powered Suggestions**: Leverages Google Gemini 2.0 Flash through Genkit to suggest complementary grocery items based on your current shopping list.
- **Rule-Based Fallback**: When the AI service is unavailable, an intelligent rule-based system provides relevant suggestions based on item categories and common pairings.
- **Server-Side Rendering**: Built with Angular SSR for improved performance and SEO.
- **Zoneless Change Detection**: Uses Angular 20's zoneless change detection for optimized rendering.
- **Persistent State**: Grocery lists are automatically saved to localStorage and restored on page reload.
- **Responsive Design**: Fully responsive interface that works on desktop and mobile devices.
- **Smart Categorization**: Items are automatically categorized into produce, dairy, meat, pantry, beverages, snacks, or other.
- **Unit Suggestions**: Intelligent unit suggestions based on item type (e.g., milk in gallons, meat in pounds).

## Technology Stack

| Layer              | Technology                                    |
|--------------------|-----------------------------------------------|
| Frontend           | Angular 20, TypeScript 5.8                    |
| SSR                | Angular SSR, Express 5                        |
| AI                 | Google Genkit, Vertex AI (Gemini 2.0 Flash)   |
| Schema Validation  | Zod                                            |
| HTTP Client        | Angular HttpClient with Fetch API             |
| Styling            | CSS (component-scoped)                        |
| Testing            | Jasmine, Karma                                |
| Build Tool         | Angular CLI 20                                |

## Architecture

```
+------------------------------------------------------------------+
|                      BROWSER (CLIENT)                            |
|                                                                  |
|  main.ts --> bootstrapApplication(App, appConfig)                |
|               |                                                   |
|               +-- App (Root Standalone Component)                 |
|               |     +-- RouterOutlet (Lazy Loading)               |
|               |     +-- Navigation / Footer Shell                 |
|               |                                                   |
|               +-- Home (Standalone, OnPush)                       |
|                     +-- Grocery Service (Signals + localStorage) |
|                     +-- AiGroceryAssistant Service                |
|                           +-- httpResource() --> POST /api/...   |
|                                                                  |
+---------------------------+--------------------------------------+
                            | HTTP (Fetch)
                            v
+------------------------------------------------------------------+
|                   SERVER (Node.js / Express)                     |
|                                                                  |
|  server.ts                                                       |
|    +-- Express 5 + CORS + JSON Body Parser                       |
|    +-- POST /api/smart-suggestions                               |
|    |     +-- calls simpleSuggestionsFlow (Genkit)                |
|    +-- Static File Serving (/browser)                            |
|    +-- Angular SSR (AngularNodeAppEngine)                        |
|                                                                  |
|  genkit/index.ts                                                 |
|    +-- Genkit + Vertex AI (Gemini 2.0 Flash)                     |
|    +-- simpleSuggestionsFlow (Zod-validated)                     |
|    +-- getFallbackSuggestions() (Rule-Based Fallback)            |
|                                                                  |
+------------------------------------------------------------------+
```

### Data Flow

1. User adds items to the grocery list or clicks "Generate Smart List"
2. The Home component updates the Grocery service (signal + localStorage)
3. AiGroceryAssistant.generateSmartSuggestions() triggers the apiRequest signal
4. httpResource() automatically fires a POST request to /api/smart-suggestions
5. Express server receives the request and invokes the Genkit flow
6. Genkit constructs a prompt and calls Gemini 2.0 Flash via Vertex AI
7. If AI fails, the rule-based fallback engine generates complementary suggestions
8. The response flows back through httpResource() and is reactively rendered in the template

## Prerequisites

- Node.js 20.19 or later
- npm 10.x or later
- Angular CLI 20 (`npm install -g @angular/cli`)
- Google Cloud Platform account (for Vertex AI - optional, fallback works without it)

## Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/ZainulabdeenOfficial/smart-grocery-assistant.git
   cd smart-grocery-assistant
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. Configure environment variables:
   ```bash
   cp .env.example .env
   ```
   Edit `.env` with your Google Cloud credentials (optional - the application works without AI using the rule-based fallback).

4. Start the development server:
   ```bash
   ng serve
   ```

5. Open your browser and navigate to `http://localhost:4200`

## Development Server

Run `ng serve` for a development server with hot-reload. The application will automatically reload when you modify source files.

For SSR mode in development:
```bash
ng serve
```
The custom Express API routes are served through the Angular dev server.

## Build

Run `ng build` to build the project for production. The build artifacts will be stored in the `dist/` directory.

```bash
ng build
```

## Production Server

After building, run the production server:

```bash
node dist/smart-grocery-assistant/server/server.mjs
```

The server will start on port 4000 by default (configurable via the PORT environment variable).

## Running Tests

```bash
ng test
```

## Project Structure

```
src/
  index.html                    Application shell
  main.ts                       Client-side entry point
  main.server.ts                Server-side bootstrap
  server.ts                     Express server with SSR and API
  styles.css                    Global styles
  genkit/
    index.ts                    Genkit AI flow configuration
  app/
    app.ts                      Root component
    app.html                    Root template
    app.css                     Root styles
    app.config.ts               Client-side application config
    app.config.server.ts        Server-side application config
    app.routes.ts               Route definitions
    app.routes.server.ts        Server-side route configuration
    constants/
      units.ts                  Unit definitions and suggestion logic
    models/
      grocery.type.ts           TypeScript interfaces and enums
    pages/
      home/
        home.ts                 Main grocery list component
        home.html               Home page template
        home.css                Home page styles
    services/
      grocery.ts                Grocery list service with persistence
      ai-grocery-assistant.ts   AI suggestion service with httpResource
```

## API Endpoints

### POST /api/smart-suggestions

Generates AI-powered suggestions for complementary grocery items.

**Request Body:**
```json
{
  "items": [
    { "id": "abc123", "name": "Milk", "category": "dairy", "quantity": 1, "unit": "gallon" },
    { "id": "def456", "name": "Bread", "category": "pantry", "quantity": 1, "unit": "loaf" }
  ]
}
```

**Response:**
```json
[
  {
    "item": {
      "id": "xyz789",
      "name": "Bananas",
      "category": "produce",
      "quantity": 1,
      "unit": "bunch"
    },
    "reason": "complementary",
    "priority": "medium"
  }
]
```

## Screenshots

Screenshots of the application are available in the `images/` directory:

- `images/home.png` - Main application view with grocery list
- `images/suggestions.png` - AI-powered suggestion cards
- `images/welcome.png` - Welcome screen for new users

## Workflow

```
START
  |
  v
User opens application
  |
  +--> No saved list? --> Welcome screen displayed
  |                         |
  |                         +--> User adds items manually
  |                         |       |
  |                         |       v
  |                         |   Item added to list
  |                         |       |
  |                         +--> User clicks "Generate Smart List"
  |                                 |
  +--> Saved list exists? --> Current list loaded from localStorage
                                |
                                v
                        User modifies list (add/remove items)
                                |
                                v
                        refreshSuggestions() called
                                |
                                v
                        POST /api/smart-suggestions
                                |
                                v
                    +-----------++-----------+
                    |   Genkit AI Available   |
                    +-----------+-------------+
                                |
              +-----------------+------------------+
              |                                    |
              v                                    v
      Gemini 2.0 Flash                    Rule-Based Fallback
      processes items                     matches items against
      and returns AI                      9 predefined rules or
      suggestions                         returns 5 default items
              |                                    |
              +-----------------+------------------+
                                |
                                v
                        Suggestions displayed
                        in reactive cards
                                |
                                v
                      User clicks "Add to List"
                                |
                                v
                        Item added to list
                        Suggestions refreshed
                                |
                                v
                        User continues shopping
```

## Angular 20 Features

This project demonstrates several Angular 20 features:

- **Standalone Components**: No NgModules required
- **inject() Function**: Dependency injection without constructor parameters
- **Signals**: Reactive state management with signal(), computed(), and input()
- **httpResource()**: Declarative HTTP resource tied to signals
- **Zoneless Change Detection**: provideZonelessChangeDetection() for optimized performance
- **OnPush Change Detection**: Component-level change detection optimization
- **New Control Flow**: @if, @for, @else syntax in templates
- **SSR with Event Replay**: Server-side rendering with provideClientHydration(withEventReplay())
- **Global Error Listeners**: provideBrowserGlobalErrorListeners() for error handling

## License

MIT

## Credits

- **M Zain Ul Abideen** - Full Stack Developer

  GitHub: [ZainulabdeenOfficial](https://github.com/ZainulabdeenOfficial)
