export default function timePickerNrql(props) {
  const { timeRange } = props.launcherUrlState;
  if (!timeRange) {
    return 'SINCE 1 hour ago';
  }
  if (timeRange.begin_time && timeRange.end_time) {
    return `SINCE ${timeRange.begin_time} UNTIL ${timeRange.end_time}`;
  } else {
    return `SINCE ${timeRange.duration / 60000} MINUTES AGO`;
  }
}
