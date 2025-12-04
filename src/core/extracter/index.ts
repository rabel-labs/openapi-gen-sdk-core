//-> Visitors
import InfoExtracter from '@/core/extracter/info/extracter';
import openapiInfoHandlers from '@/core/extracter/info/ns/openapi';
export const infoExtracter = new InfoExtracter([...openapiInfoHandlers]);
