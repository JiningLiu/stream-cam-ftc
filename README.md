<h1 align="center">
🤖 stream-cam-ftc
</h1>

<p align="center">
<b>
🎥 FTC live stream overlays & automatic camera switcher 🔴
</b>
</p>

> ### 🚧 This project is in early development. Please check back for more information.

## Development

```bash
# install depenncies
bun i

# run in development environment
bun dev
```

## Building, Testing, and Production

```bash
# build for production environment
bun run build
```

### Build Testing

```bash
PORT=6401 bun ./build
```

### Production Testing

In order to test within the `stream-cam` repository, locate the `extensions/` folder in your `stream-cam` installation or development repo. 

Copy your `build/` folder, generated from the previous command, into the `stream-cam/extensions/` folder. Rename the newly copied build folder to `ftc`.

Boot up the `stream-cam` server as usual. In order to start the extension, a `POST` call must be made to the extensions server. Here's how you can enable the `ftc` extension using the `curl` command.

```bash
# replace localhost with stream-cam server hostname
curl 'http://localhost:6400/ftc' \
-X 'POST'
```

The `ftc` extension will now be ready at `http://localhost:6401/` (Replace `localhost` with stream-cam server hostname).

## License

Open source information to come. Planned release under the MIT License.

© 2024-2025 Jining Liu, FTC Team 20240 Slingshot, and contributors. All rights reserved.