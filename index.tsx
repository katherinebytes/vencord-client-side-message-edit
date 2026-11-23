/*
 * SPDX-License-Identifier: Unlicense
 */

import { NavContextMenuPatchCallback } from "@api/ContextMenu";
import { updateMessage } from "@api/MessageUpdater";
import { PencilIcon } from "@components/Icons";
import definePlugin from "@utils/types";
import type { Message } from "@vencord/discord-types";
import { findByPropsLazy } from "@webpack";
import { AuthenticationStore, ChannelStore, FluxDispatcher, Menu } from "@webpack/common";

const MessageActions = findByPropsLazy("endEditMessage", "startEditMessage");

function isOwnMessage(message: Message) {
    return message.author?.id === AuthenticationStore.getId();
}

function startLocalEdit(message: Message) {
    MessageActions.startEditMessage(
        message.channel_id,
        message.id,
        message.content ?? ""
    );
}

const messageContextMenuPatch: NavContextMenuPatchCallback = (children, { message }: { message: Message; }) => {
    // Discord already supplies its own Edit item for editable messages authored
    // by the current user. Add the same flow only where Discord omits it.
    if (isOwnMessage(message)) return;

    children.push(
        <Menu.MenuItem
            id="vc-client-side-message-edit"
            key="vc-client-side-message-edit"
            label="Edit (Client Side)"
            icon={PencilIcon}
            action={() => startLocalEdit(message)}
        />
    );
};

export default definePlugin({
    name: "ClientSideMessageEdit",
    description: "Edits message content only in your local message cache and never modifies the message on Discord.",
    authors: [{ name: "UniEdit", id: 0n }],

    contextMenus: {
        message: messageContextMenuPatch
    },

    messagePopoverButton: {
        icon: PencilIcon,
        render(message: Message) {
            // Avoid duplicating Discord's native pencil button on the current
            // user's messages.
            if (isOwnMessage(message)) return null;

            return {
                label: "Edit Message (Client Side)",
                icon: PencilIcon,
                message,
                channel: ChannelStore.getChannel(message.channel_id),
                onClick: () => startLocalEdit(message)
            };
        }
    },

    onBeforeMessageEdit(channelId: string, messageId: string, message) {
        updateMessage(channelId, messageId, {
            content: message.content
        });

        // Reply previews live in Discord's separate ReferencedMessageStore.
        // A local Flux update makes it merge the same content into every
        // cached preview without making any network request.
        FluxDispatcher.dispatch({
            type: "MESSAGE_UPDATE",
            message: {
                channel_id: channelId,
                id: messageId,
                content: message.content
            }
        });

        // Close this channel's active edit composer without supplying a
        // server response. Discord requires the channel id for this action.
        MessageActions.endEditMessage(channelId);

        // Vencord's MessageEventsAPI checks this before Discord invokes
        // editMessage. Cancelling here guarantees that no PATCH request runs.
        return { cancel: true };
    }
});
