import * as vscode from 'vscode';

import * as model from '../model';
import { VaultViewTreeItem } from "./tree-item";
import { VaultViewEmptyTreeItem } from './empty-tree-view';
import { VaultViewSecretTreeItem } from './secret-tree-view';

export class VaultViewMountTreeItem extends VaultViewTreeItem {
    constructor(private vaultMount: model.VaultMount, parent: VaultViewTreeItem) {
        super(vaultMount.name, parent);
        this.contextValue = 'mount';
        this.iconPath = new vscode.ThemeIcon('folder-opened');
        this.collapsibleState = vscode.TreeItemCollapsibleState.Collapsed;
    }

    async refresh(returnException?: boolean): Promise<boolean> {
        try {
            const secrets = await this?.connection?.secrets(this.vaultMount) || [];

            const oldSecrets = this.children;
            this.children = undefined;
            if (secrets.length === 0) {
                this.children = [
                    new VaultViewEmptyTreeItem(this)
                ];
            } else {
                for (const secret of secrets) {
                    const secretView = oldSecrets?.find(f => f.label === secret.name);
                    this.addChild(secretView || new VaultViewSecretTreeItem(secret, this));
                }
            }
        } catch (err: unknown) {
            if (returnException) {
                throw err;
            } else {
                const message = typeof err === "string" ? err :
                    err instanceof Error ? err.message : 'unknown';
                vscode.window.showErrorMessage(`Vault Error: (${message})`);

                if (!this.children) {
                    this.children = [
                        new VaultViewEmptyTreeItem(this)
                    ];
                }
            }
        }

        return true;
    }
}