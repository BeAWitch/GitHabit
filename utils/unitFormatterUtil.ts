import pluralize from 'pluralize';

export const formatUnit = (count: number, unitLabel: string) => {
    // 特殊处理一些不需要变复数的词，比如中文字符、符号或特定的词如 done
    if (unitLabel === 'done' || /[\u4e00-\u9fa5]/.test(unitLabel)) {
        return unitLabel;
    }
    // pluralize 自动处理 1 time, 2 times 甚至不规则变化 box -> boxes
    return pluralize(unitLabel, count, false); 
}
