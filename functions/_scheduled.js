/**
 * Scheduled handler for Etsy catalogue sync.
 *
 * Note: the handler is valid Worker code, but Cloudflare Pages does not expose
 * Cron Triggers for a `functions/`-folder Pages project. To run this on a real
 * schedule, migrate the deployment target to a Worker (or another scheduler)
 * and keep calling syncEtsyCatalogue(env) from that scheduled entrypoint.
 */

import { syncEtsyCatalogue } from './api/etsy/_catalogue.js'

/**
 * @param {ScheduledController} controller
 * @param {Record<string, unknown>} env
 * @param {ExecutionContext} ctx
 */
export async function scheduled(controller, env, ctx) {
  const run = syncEtsyCatalogue(env).then((result) => {
    console.log(
      '[etsy-sync] scheduled',
      result && result.ok ? 'ok' : result && result.error ? result.error : 'unknown',
    )
    return result
  })
  if (ctx && typeof ctx.waitUntil === 'function') {
    ctx.waitUntil(run)
  }
  await run
}
