'use strict';
import { Disposable } from 'vscode';
import { Post, PostsReceivedEvent } from '../api/session';
import { Container } from '../container';

const codestreamRegex = /codestream:\/\/(.*?)\?d=(.*?)(?:\s|$)/; // codestream://service/action?d={data}

export class LinkActionsController extends Disposable {

    private _disposable: Disposable | undefined;

    constructor() {
        super(() => this.dispose());
    }

    dispose() {
        this._disposable && this._disposable.dispose();
    }

    private async onSessionPostsReceived(e: PostsReceivedEvent) {
        const currentUserId = Container.session.user.id;

        for (const post of e.items()) {
            if (post.senderId === currentUserId) continue;

            const match = codestreamRegex.exec(post.text);
            if (match == null) continue;

            const [, path, qs] = match;

            const callback = this._registrationMap.get(path);
            if (callback === undefined) continue;

            callback(post, JSON.parse(decodeURIComponent(qs)));
        }
    }

    private _registrationMap = new Map<string, ((post: Post, context: any) => any)>();
    register<T>(service: string, action: string, callback: (post: Post, context: T) => any, thisArg?: any): Disposable {
        const key = `${service}/${action}`;
        this._registrationMap.set(key, thisArg !== undefined ? callback.bind(thisArg) : callback);
        this.ensureRegistrations();

        return new Disposable(() => {
            this._registrationMap.delete(key);
            this.ensureRegistrations();
        });
    }

    toLinkAction<T>(service: string, action: string, context: T) {
        return `codestream://${service}/${action}?d=${encodeURIComponent(JSON.stringify(context))}`;
    }

    private ensureRegistrations() {
        if (this._registrationMap.size === 0) {
            if (this._disposable !== undefined) {
                this._disposable.dispose();
                this._disposable = undefined;
            }
        }
        else if (this._disposable === undefined) {
            this._disposable = Disposable.from(
                Container.session.onDidReceivePosts(this.onSessionPostsReceived, this)
            );
        }
    }
}
