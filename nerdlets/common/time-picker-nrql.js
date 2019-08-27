export default function timePickerNrql(props) {
  const { timeRange } = props.launcherUrlState;
  if(!timeRange) {
    return "SINCE 1 hour ago"
  }
  if (timeRange.beginTime && timeRange.endTime) {
    return `SINCE ${timeRange.beginTime} UNTIL ${timeRange.endTime}`;
  }
  else {
    return `SINCE ${timeRange.duration / 60000} MINUTES AGO`;
  }
}
