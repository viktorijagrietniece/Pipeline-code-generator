import nunjucks from 'nunjucks';
import jenkinsTemplate from './jenkinsTemplate';

export function renderJenkinsfile(pipelineJson) {
  nunjucks.configure({ autoescape: false, trimBlocks: true, lstripBlocks: true });
  return nunjucks.renderString(jenkinsTemplate, pipelineJson);
}
