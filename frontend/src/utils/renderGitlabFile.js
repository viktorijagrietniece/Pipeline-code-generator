import nunjucks from 'nunjucks';
import gitlabTemplate from './gitlabTemplate';

export function renderGitlabFile(gitlabJson) {
  nunjucks.configure({ autoescape: false });
  return nunjucks.renderString(gitlabTemplate, gitlabJson);
}
