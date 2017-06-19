
export class Fn {

    static id(self) {
        return self
    }
}

export class Sanitize {

    static string(fn=Fn.id) {
        return new Sanitize(fn)
    }

    static pipeline(...fns) {
        let combined = new Sanitize(Fn.id)
        fns.forEach((fn) => {
            combined = combined.andThen(fn)
        })
        return combined
    }

    static toFn(sanitize) {
        return sanitize.sanitize ? sanitize.sanitize : sanitize
    }

    constructor(sanitize) {
        this.sanitize = (str) => str === null ? null : sanitize(str)
    }

    compose(prev) {
        return new Sanitize((str) => this.sanitize(Sanitize.toFn(prev)(str)))
    }

    andThen(next) {
        return new Sanitize((str) => Sanitize.toFn(next)(this.sanitize(str)))
    }
}

const validatePositiveNumExp = /^[1-9]?[0-9]*$/

Sanitize.trimmed = Sanitize.string((s) => s.trim())
Sanitize.postiveNum = Sanitize.string((str) =>
    validatePositiveNumExp.test(str) ? str : null
)
