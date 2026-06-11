// Live career duration since the first professional commit, no date library needed.
const CAREER_START = new Date(2017, 5, 19); // 19 Jun 2017

export function careerDuration(now = new Date()) {
  let years = now.getFullYear() - CAREER_START.getFullYear();
  let months = now.getMonth() - CAREER_START.getMonth();
  let days = now.getDate() - CAREER_START.getDate();

  if (days < 0) {
    months -= 1;
    // Days in the month preceding `now`.
    days += new Date(now.getFullYear(), now.getMonth(), 0).getDate();
  }
  if (months < 0) {
    years -= 1;
    months += 12;
  }
  return { years, months, days };
}

export function formatCareerDuration(now = new Date()) {
  const { years, months, days } = careerDuration(now);
  return `${years} years, ${months} months and ${days} days`;
}
