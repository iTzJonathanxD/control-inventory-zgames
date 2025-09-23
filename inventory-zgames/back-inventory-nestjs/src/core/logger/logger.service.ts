import { ConsoleLogger, Injectable, Scope } from "@nestjs/common"

@Injectable({ scope: Scope.TRANSIENT })
export class Logger extends ConsoleLogger {
  error(message: any, trace?: string, context?: string): void {
    super.error(message, trace, context)
  }

  warn(message: any, context?: string): void {
    super.warn(message, context)
  }

  log(message: any, context?: string): void {
    super.log(message, context)
  }

  debug(message: any, context?: string): void {
    super.debug(message, context)
  }

  verbose(message: any, context?: string): void {
    super.verbose(message, context)
  }
}
