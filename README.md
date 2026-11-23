# ClientSideMessageEdit

A Vencord Web-compatible userplugin that uses Discord's standard edit composer
but applies submitted message text only to the local Vencord/Discord cache.
Discord's remote message is never modified.

## Features

- Adds the standard pencil action to messages from other users.
- Keeps the native Edit action for your own messages.
- Updates cached reply previews when their referenced message is edited.
- Does not add an `(edited)` marker.
- Makes no message-edit request to Discord.
- Uses Vencord's normal plugin enable/disable switch.

Local edits are intentionally temporary. Reloading Discord, discarding the
channel cache, or receiving fresh server data can restore the server's original
content.

## Install

Clone this repository into a Vencord source checkout:

```sh
cd Vencord/src/userplugins
git clone https://github.com/katherinereinert/vencord-client-side-message-edit.git clientSideMessageEdit
cd ../..
pnpm buildWeb
```

Load `dist/chromium-unpacked` as an unpacked Chrome extension, then enable
**ClientSideMessageEdit** in Vencord's plugin settings.

## License

This project is released into the public domain under the Unlicense. See [LICENSE](LICENSE).
