<h1 align="center">ConfigKit</h1>

<p align="center">
  <a href="https://explosion-scratch.github.io/ConfigKit">
    <img src="./src/assets/icon.png" width="128" height="128" alt="ConfigKit logo">
  </a>
</p>

<p align=center>
    <a href="https://explosion-scratch.github.io/ConfigKit">
      <i>Use online</i>
    </a>
</p>

<p align="center"><i>ConfigKit is an elegant macOS defaults configuration generator with sensible defaults. Navigate all the complex shell scripts much more easily!</i></p>

## Features

- 🎨 Modern, intuitive user interface
- 🔍 Search and filter capabilities
- 📁 Organized by categories
- 💾 Persistent settings storage
- ⚙️ Generate shell scripts
- 🎯 Suggested default values

## Getting Started

Go to https://explosion-scratch.github.io/ConfigKit to start using ConfigKit directly in your browser.

## Running Locally

### Prerequisites

- Node.js 16+
- bun, npm or yarn
- A modern web browser

### Installation

```bash
# Clone the repository
git clone https://github.com/yourusername/configkit.git

# Navigate to the project directory
cd configkit

# Install dependencies
bun install

# Start the development server
bun run dev
```

### Usage

1. Visit the application in your browser
2. Browse or search for settings you want to modify
3. Adjust settings to your preferences
4. Click "Generate" to create your configuration script
5. Review and run the generated script

## Development

```bash
# Run development server
bun run dev

# Build for production
bun run build

# Preview production build
bun run preview
```

## Structure

```
configkit/
├── src/
│   ├── assets/          # Static assets
│   ├── components/      # Vue components
│   ├── App.vue         # Main application component
│   └── main.js         # Application entry point
├── public/
│   └── flags.json      # Settings database
└── index.html          # Entry HTML file
```

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request
