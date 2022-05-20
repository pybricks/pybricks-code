// SPDX-License-Identifier: MIT
// Copyright (c) 2022 The Pybricks Authors

export class CustomError<T extends string> extends Error {
    declare name: T;

    public constructor(name: T, message: string, cause?: Error) {
        super(message, { cause });
        this.name = name;
        Object.setPrototypeOf(this, new.target.prototype);
    }

    public toString(): string {
        return `[${this.constructor.name}: ${this.name}]`;
    }

    public toJSON(): string {
        return this.toString();
    }
}
