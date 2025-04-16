import { Config, configSchema } from 'src/schemas/config.schema';

export function validate(raw: Record<string, unknown>) {
  const env: Config = {
    server: {
      nodeEnv: raw.NODE_ENV as string,
      port: parseInt((raw.PORT as string) || '3000'),
    },
    kafka: {
      app: {
        client: {
          clientId: raw.KAFKA_CLIENT_ID as string,
          brokers: (raw.KAFKA_BROKERS as string).split(','),
        },
        consumer: {
          groupId: raw.KAFKA_GROUP_ID as string,
        },
      },
    },
    openai: {
      api_key: raw.OPENAI_API_KEY as string,
      system_message: {
        daily: {
          all: raw.OPENAI_SYSTEM_MESSAGE_DAILY_ALL as string,
        },
        yearly: {
          chart: raw.OPENAI_SYSTEM_MESSAGE_YEARLY_CHART as string,
          general: raw.OPENAI_SYSTEM_MESSAGE_YEARLY_GENERAL as string,
          relationship: raw.OPENAI_SYSTEM_MESSAGE_YEARLY_RELATIONSHIP as string,
          wealth: raw.OPENAI_SYSTEM_MESSAGE_YEARLY_WEALTH as string,
          romantic: raw.OPENAI_SYSTEM_MESSAGE_YEARLY_ROMANTIC as string,
          health: raw.OPENAI_SYSTEM_MESSAGE_YEARLY_HEALTH as string,
          career: raw.OPENAI_SYSTEM_MESSAGE_YEARLY_CAREER as string,
          waysToImprove:
            raw.OPENAI_SYSTEM_MESSAGE_YEARLY_WAYS_TO_IMPROVE as string,
          caution: raw.OPENAI_SYSTEM_MESSAGE_YEARLY_CAUTION as string,
          questionAnswer:
            raw.OPENAI_SYSTEM_MESSAGE_YEARLY_QUESTION_ANSWER as string,
        },
      },
    },
    auth: {
      gatewayJwtSecret: raw.AUTH_GATEWAY_JWT_SECRET as string,
      gatewayJwtHeader: raw.AUTH_GATEWAY_JWT_HEADER as string,
    },
  };

  const parsedEnv = configSchema.parse(env);
  return parsedEnv;
}
