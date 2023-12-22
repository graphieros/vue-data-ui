export function setupTemplate(template, args = {}) {
    const { args: moreArgs = {}} = template;
    const templateClone = template.bind();
    templateClone.args = {
        ...moreArgs,
        ...args
    }
    return templateClone;
}