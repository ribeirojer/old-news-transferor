export function getTwoMonthsAgoDate(): string {
	const twoMonthsAgo = new Date();
	twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 2);
	return twoMonthsAgo.toISOString();
}
