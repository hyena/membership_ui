import { Sanitize } from '../../functional'

export const ballotKeySanitizer = Sanitize.pipeline(
    Sanitize.trimmed,
    Sanitize.postiveNum,
    Sanitize.string((pos) => pos.length === 5 ? pos : null)
)
