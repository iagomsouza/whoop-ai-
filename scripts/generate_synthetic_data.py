import pandas as pd
import numpy as np
import os
import datetime

# Constants for Executive Alex persona
NUM_DAYS = 90

# HRV parameters
HRV_BASELINE_MEAN = 50  # ms, center of the 45-55ms range
HRV_BASELINE_MIN = 45
HRV_BASELINE_MAX = 55
HRV_DAILY_STD_DEV = 3   # Standard deviation for daily HRV fluctuation
HRV_MIN = 35
HRV_MAX = 65
HRV_BASELINE_DRIFT_STD_DEV = 0.5 # How much the personal baseline might drift day-to-day

# RHR parameters
RHR_BASELINE_MEAN = 55  # bpm, center of the 50-60bpm typical range
RHR_DAILY_STD_DEV = 1.5 # Standard deviation for daily RHR fluctuation
RHR_MIN = 45
RHR_MAX = 65
RHR_HRV_CORRELATION_FACTOR = -0.4 # How much RHR deviates for each unit HRV deviates from its mean

# Sleep parameters
SLEEP_DURATION_MEAN_HOURS = 7.25
SLEEP_DURATION_STD_DEV_HOURS = 0.75
SLEEP_DURATION_MIN_HOURS = 6.0
SLEEP_DURATION_MAX_HOURS = 8.5
SLEEP_EFFICIENCY_MEAN_PERCENT = 85.0
SLEEP_EFFICIENCY_STD_DEV_PERCENT = 4.0
SLEEP_EFFICIENCY_MIN_PERCENT = 70.0
SLEEP_EFFICIENCY_MAX_PERCENT = 95.0
SLEEP_REM_PERCENT_MEAN = 22.5
SLEEP_DEEP_PERCENT_MEAN = 17.5
SLEEP_STAGE_PERCENT_STD_DEV = 2.0
# Max combined REM and Deep percentage to ensure Light sleep has enough room
MAX_REM_DEEP_PERCENT_SUM = 50.0 

# Strain parameters
WORKOUT_DAYS_STRAIN_MEAN = 13.5 # Average strain on a workout day (center of 10-17)
WORKOUT_DAYS_STRAIN_STD_DEV = 2.0
WORKOUT_DAYS_STRAIN_MIN = 10.0
WORKOUT_DAYS_STRAIN_MAX = 17.0
NON_WORKOUT_DAYS_STRAIN_MEAN = 6.5 # Average strain on a non-workout day (center of 4-9)
NON_WORKOUT_DAYS_STRAIN_STD_DEV = 1.5
NON_WORKOUT_DAYS_STRAIN_MIN = 4.0
NON_WORKOUT_DAYS_STRAIN_MAX = 9.0
# Executive Alex workout days: Monday (0), Wednesday (2), Friday (4), Saturday (5)
WORKOUT_DAY_INDICES = [0, 2, 4, 5] 

# Recovery Score Parameters
RECOVERY_HRV_WEIGHT = 0.40
RECOVERY_RHR_WEIGHT = 0.15
RECOVERY_SLEEP_QUALITY_WEIGHT = 0.30
RECOVERY_PREV_STRAIN_WEIGHT = 0.15
# For sleep quality calculation within recovery
SLEEP_DURATION_WEIGHT_IN_QUALITY = 0.6
SLEEP_EFFICIENCY_WEIGHT_IN_QUALITY = 0.4
ASSUMED_PREV_DAY_STRAIN_FOR_DAY_0 = 10.0 # Assumed strain for the day before the dataset starts

# Overall Min/Max for normalization (can be refined)
OVERALL_STRAIN_MIN_FOR_RECOVERY_NORMALIZATION = NON_WORKOUT_DAYS_STRAIN_MIN 
OVERALL_STRAIN_MAX_FOR_RECOVERY_NORMALIZATION = WORKOUT_DAYS_STRAIN_MAX

# Work Stress Parameters
# Define stress periods (e.g., week numbers from the start of the 90-day period)
# Week 1 is days 0-6, Week 5 is days 28-34, Week 10 is days 63-69
STRESS_WEEKS_START_DAYS = [28, 63] # Start days of stress weeks (0-indexed)
STRESS_WEEK_DURATION_DAYS = 7
STRESS_IMPACT_HRV_REDUCTION_MEAN = 7 #ms reduction
STRESS_IMPACT_HRV_REDUCTION_STD = 2
STRESS_IMPACT_SLEEP_DURATION_REDUCTION_HOURS_MEAN = 0.75 # hours reduction
STRESS_IMPACT_SLEEP_DURATION_REDUCTION_HOURS_STD = 0.25
STRESS_IMPACT_SLEEP_EFFICIENCY_REDUCTION_PERCENT_MEAN = 8 # percent reduction
STRESS_IMPACT_SLEEP_EFFICIENCY_REDUCTION_PERCENT_STD = 2

# Travel Day Parameters
TRAVEL_DAYS_INDICES = [14, 15, 44, 45] # 0-indexed days for travel (e.g., day 15, 16, 45, 46 of the 90-day period)
# Day 14: Travel out, Day 15: Away, Day 44: Red-eye travel, Day 45: Arrival/Recovery from red-eye
TRAVEL_SLEEP_DURATION_REDUCTION_HOURS_MEAN = 2.0
TRAVEL_SLEEP_DURATION_REDUCTION_HOURS_STD = 0.5
TRAVEL_SLEEP_EFFICIENCY_REDUCTION_PERCENT_MEAN = 10.0
TRAVEL_SLEEP_EFFICIENCY_REDUCTION_PERCENT_STD = 3.0

RED_EYE_DAY_INDEX = 44 # Day of the red-eye flight itself
RED_EYE_SLEEP_DURATION_HOURS_MEAN = 2.5
RED_EYE_SLEEP_DURATION_HOURS_STD = 0.5
RED_EYE_SLEEP_EFFICIENCY_PERCENT_MEAN = 50.0
RED_EYE_SLEEP_EFFICIENCY_PERCENT_STD = 10.0

POST_RED_EYE_DAY_INDEX = 45 # Day after red-eye
POST_RED_EYE_SLEEP_DURATION_HOURS_MEAN = SLEEP_DURATION_MEAN_HOURS + 1.5 # Attempt to catch up
POST_RED_EYE_SLEEP_DURATION_HOURS_STD = 0.75
POST_RED_EYE_SLEEP_EFFICIENCY_PERCENT_MEAN = SLEEP_EFFICIENCY_MEAN_PERCENT - 5 # Still a bit off
POST_RED_EYE_SLEEP_EFFICIENCY_PERCENT_STD = SLEEP_EFFICIENCY_STD_DEV_PERCENT

# Seasonal Trend Parameters
HRV_BASELINE_TOTAL_TREND_MS = 3 # Total increase in HRV baseline over NUM_DAYS (e.g., +3ms)
SLEEP_DURATION_TOTAL_TREND_HOURS = -0.3 # Total change in avg sleep over NUM_DAYS (e.g., -0.3 hours as spring/summer progresses)

END_DATE = datetime.date(2025, 6, 1)
START_DATE = END_DATE - datetime.timedelta(days=NUM_DAYS - 1)

# --- Output File Configuration ---
OUTPUT_DIR = "data"
OUTPUT_FILENAME = "synthetic_user_data.json"
OUTPUT_FILE_PATH = os.path.join(OUTPUT_DIR, OUTPUT_FILENAME)

def generate_daily_metrics(num_days: int, start_date: datetime.date) -> pd.DataFrame:
    """
    Generates 90 days of correlated HRV, RHR, Sleep, Strain, and Recovery data for Executive Alex.
    """
    dates = pd.date_range(start=start_date, periods=num_days, freq='D')
    
    hrv_values = []
    rhr_values = []
    sleep_duration_hours_values = []
    sleep_efficiency_percent_values = []
    sleep_rem_hours_values = []
    sleep_deep_hours_values = []
    sleep_light_hours_values = []
    strain_score_values = []
    recovery_score_percent_values = []
    
    current_hrv_baseline = HRV_BASELINE_MEAN
    
    for i in range(num_days):
        # Determine if it's a stress day
        is_stress_day = False
        for stress_start_day in STRESS_WEEKS_START_DAYS:
            if stress_start_day <= i < stress_start_day + STRESS_WEEK_DURATION_DAYS:
                is_stress_day = True
                break

        # Simulate daily HRV
        daily_hrv = np.random.normal(current_hrv_baseline, HRV_DAILY_STD_DEV)
        if is_stress_day:
            hrv_reduction = np.random.normal(STRESS_IMPACT_HRV_REDUCTION_MEAN, STRESS_IMPACT_HRV_REDUCTION_STD)
            daily_hrv -= hrv_reduction
        daily_hrv = np.clip(daily_hrv, HRV_MIN, HRV_MAX)
        hrv_values.append(round(daily_hrv))
        
        # Update HRV baseline with a slow drift AND seasonal trend for next day
        baseline_drift = np.random.normal(0, HRV_BASELINE_DRIFT_STD_DEV)
        # Apply a portion of the total seasonal trend each day
        daily_hrv_trend_increment = HRV_BASELINE_TOTAL_TREND_MS / num_days
        current_hrv_baseline_for_next_day = current_hrv_baseline + baseline_drift + daily_hrv_trend_increment
        
        if is_stress_day: # Stress might also slightly pull down the baseline itself
            current_hrv_baseline_for_next_day -= HRV_BASELINE_DRIFT_STD_DEV * 0.5 # Small pull down on top of other changes
        current_hrv_baseline = np.clip(current_hrv_baseline_for_next_day, HRV_BASELINE_MIN, HRV_BASELINE_MAX)
        
        # Simulate daily RHR (correlated with final daily_hrv)
        # RHR correlation should ideally be against the *current day's actual baseline* not the initial mean
        # For simplicity, we'll keep it against the initial mean, but acknowledge this could be refined
        hrv_deviation_from_mean = daily_hrv - HRV_BASELINE_MEAN # Compare to original mean for correlation logic
        rhr_target_from_hrv = RHR_BASELINE_MEAN + (hrv_deviation_from_mean * RHR_HRV_CORRELATION_FACTOR)
        daily_rhr = np.random.normal(rhr_target_from_hrv, RHR_DAILY_STD_DEV)
        daily_rhr = np.clip(daily_rhr, RHR_MIN, RHR_MAX)
        rhr_values.append(round(daily_rhr))

        # Simulate Sleep Duration
        # Simulate Sleep Duration (initial generation, with seasonal trend)
        daily_sleep_trend_adjustment = (SLEEP_DURATION_TOTAL_TREND_HOURS / num_days) * i
        current_target_sleep_duration = SLEEP_DURATION_MEAN_HOURS + daily_sleep_trend_adjustment
        daily_sleep_duration = np.random.normal(current_target_sleep_duration, SLEEP_DURATION_STD_DEV_HOURS)
        
        # Simulate Sleep Efficiency (initial generation - no specific seasonal trend applied here directly)
        daily_sleep_efficiency = np.random.normal(SLEEP_EFFICIENCY_MEAN_PERCENT, SLEEP_EFFICIENCY_STD_DEV_PERCENT)

        # Apply Stress Effects (if applicable, these modify the initial values)
        if is_stress_day:
            stress_sleep_duration_reduction = np.random.normal(STRESS_IMPACT_SLEEP_DURATION_REDUCTION_HOURS_MEAN, STRESS_IMPACT_SLEEP_DURATION_REDUCTION_HOURS_STD)
            daily_sleep_duration -= stress_sleep_duration_reduction
            stress_sleep_efficiency_reduction = np.random.normal(STRESS_IMPACT_SLEEP_EFFICIENCY_REDUCTION_PERCENT_MEAN, STRESS_IMPACT_SLEEP_EFFICIENCY_REDUCTION_PERCENT_STD)
            daily_sleep_efficiency -= stress_sleep_efficiency_reduction

        # Apply Travel Effects (if applicable, these can further modify or override stress effects for sleep)
        is_travel_day_generic = i in TRAVEL_DAYS_INDICES and i != RED_EYE_DAY_INDEX and i != POST_RED_EYE_DAY_INDEX
        
        if i == RED_EYE_DAY_INDEX:
            daily_sleep_duration = np.random.normal(RED_EYE_SLEEP_DURATION_HOURS_MEAN, RED_EYE_SLEEP_DURATION_HOURS_STD)
            daily_sleep_efficiency = np.random.normal(RED_EYE_SLEEP_EFFICIENCY_PERCENT_MEAN, RED_EYE_SLEEP_EFFICIENCY_PERCENT_STD)
        elif i == POST_RED_EYE_DAY_INDEX:
            daily_sleep_duration = np.random.normal(POST_RED_EYE_SLEEP_DURATION_HOURS_MEAN, POST_RED_EYE_SLEEP_DURATION_HOURS_STD)
            daily_sleep_efficiency = np.random.normal(POST_RED_EYE_SLEEP_EFFICIENCY_PERCENT_MEAN, POST_RED_EYE_SLEEP_EFFICIENCY_PERCENT_STD)
        elif is_travel_day_generic: # General travel day (not red-eye or post-red-eye)
            travel_sleep_duration_reduction = np.random.normal(TRAVEL_SLEEP_DURATION_REDUCTION_HOURS_MEAN, TRAVEL_SLEEP_DURATION_REDUCTION_HOURS_STD)
            daily_sleep_duration -= travel_sleep_duration_reduction # Assumes travel reduces from the potentially stress-adjusted value
            travel_sleep_efficiency_reduction = np.random.normal(TRAVEL_SLEEP_EFFICIENCY_REDUCTION_PERCENT_MEAN, TRAVEL_SLEEP_EFFICIENCY_REDUCTION_PERCENT_STD)
            daily_sleep_efficiency -= travel_sleep_efficiency_reduction

        # Final clipping for sleep duration and efficiency
        daily_sleep_duration = np.clip(daily_sleep_duration, SLEEP_DURATION_MIN_HOURS, SLEEP_DURATION_MAX_HOURS)
        daily_sleep_efficiency = np.clip(daily_sleep_efficiency, SLEEP_EFFICIENCY_MIN_PERCENT, SLEEP_EFFICIENCY_MAX_PERCENT)
        
        sleep_duration_hours_values.append(round(daily_sleep_duration, 2))
        sleep_efficiency_percent_values.append(round(daily_sleep_efficiency, 1))

        # Simulate Sleep Stages
        effective_sleep_hours = daily_sleep_duration * (daily_sleep_efficiency / 100.0)
        
        rem_p = np.random.normal(SLEEP_REM_PERCENT_MEAN, SLEEP_STAGE_PERCENT_STD_DEV)
        rem_p = np.clip(rem_p, 15.0, 30.0) # Realistic bounds for REM % 

        deep_p = np.random.normal(SLEEP_DEEP_PERCENT_MEAN, SLEEP_STAGE_PERCENT_STD_DEV)
        deep_p = np.clip(deep_p, 10.0, 25.0) # Realistic bounds for Deep %

        # Ensure REM + Deep doesn't take up too much, cap if necessary
        if rem_p + deep_p > MAX_REM_DEEP_PERCENT_SUM:
            if rem_p > deep_p: # Reduce the larger one proportionally more
                rem_p = rem_p * (MAX_REM_DEEP_PERCENT_SUM / (rem_p + deep_p))
                deep_p = MAX_REM_DEEP_PERCENT_SUM - rem_p
            else:
                deep_p = deep_p * (MAX_REM_DEEP_PERCENT_SUM / (rem_p + deep_p))
                rem_p = MAX_REM_DEEP_PERCENT_SUM - deep_p
        
        sleep_rem_hours = effective_sleep_hours * (rem_p / 100.0)
        sleep_deep_hours = effective_sleep_hours * (deep_p / 100.0)
        sleep_light_hours = effective_sleep_hours - sleep_rem_hours - sleep_deep_hours
        sleep_light_hours = max(0, sleep_light_hours) # Ensure non-negative light sleep
        
        # Normalize sleep stages to sum to effective_sleep_hours
        # Initial rem and deep are calculated from effective_sleep_hours and percentages
        # Initial light_hours is effective_sleep_hours - rem_hours - deep_hours

        # Clip individual stages to be within [0, effective_sleep_hours]
        # This ensures no single stage is negative or larger than the total effective sleep
        sleep_rem_hours = np.clip(sleep_rem_hours, 0, effective_sleep_hours)
        sleep_deep_hours = np.clip(sleep_deep_hours, 0, effective_sleep_hours)
        
        # Adjust light sleep: it takes the remainder of effective_sleep_hours after REM and Deep.
        # If REM + Deep > effective_sleep_hours due to clipping individual maxes, light sleep could be negative here.
        sleep_light_hours = effective_sleep_hours - sleep_rem_hours - sleep_deep_hours
        # So, clip light sleep to be at least 0. 
        # If light sleep becomes 0 here, it means REM + Deep might be slightly more than effective_sleep_hours.
        sleep_light_hours = np.clip(sleep_light_hours, 0, effective_sleep_hours)

        # Final normalization: Ensure the sum of the three stages is *exactly* effective_sleep_hours.
        # Distribute any tiny discrepancy (from floating point math) primarily to light sleep.
        current_stages_sum = sleep_rem_hours + sleep_deep_hours + sleep_light_hours
        if not np.isclose(current_stages_sum, effective_sleep_hours):
            diff = effective_sleep_hours - current_stages_sum
            sleep_light_hours += diff
        
        # As a final safeguard, re-clip all stages in case the diff adjustment was large (should be tiny)
        sleep_rem_hours = np.clip(sleep_rem_hours, 0, effective_sleep_hours)
        sleep_deep_hours = np.clip(sleep_deep_hours, 0, effective_sleep_hours)
        sleep_light_hours = np.clip(sleep_light_hours, 0, effective_sleep_hours)
        
        # One last check: if sum is still off (e.g. all were clipped), proportionally adjust
        # This is an edge case, typically the above handles it.
        final_stages_sum = sleep_rem_hours + sleep_deep_hours + sleep_light_hours
        if not np.isclose(final_stages_sum, effective_sleep_hours) and final_stages_sum > 0: # Avoid division by zero
            factor = effective_sleep_hours / final_stages_sum
            sleep_rem_hours *= factor
            sleep_deep_hours *= factor
            sleep_light_hours *= factor

        sleep_rem_hours_values.append(round(sleep_rem_hours, 2))
        sleep_deep_hours_values.append(round(sleep_deep_hours, 2))
        sleep_light_hours_values.append(round(sleep_light_hours, 2))

        # Simulate Strain Score
        day_of_week = dates[i].dayofweek # Monday=0, Sunday=6
        if day_of_week in WORKOUT_DAY_INDICES:
            daily_strain = np.random.normal(WORKOUT_DAYS_STRAIN_MEAN, WORKOUT_DAYS_STRAIN_STD_DEV)
            daily_strain = np.clip(daily_strain, WORKOUT_DAYS_STRAIN_MIN, WORKOUT_DAYS_STRAIN_MAX)
        else:
            daily_strain = np.random.normal(NON_WORKOUT_DAYS_STRAIN_MEAN, NON_WORKOUT_DAYS_STRAIN_STD_DEV)
            daily_strain = np.clip(daily_strain, NON_WORKOUT_DAYS_STRAIN_MIN, NON_WORKOUT_DAYS_STRAIN_MAX)
        strain_score_values.append(round(daily_strain, 1))

    # Calculate Recovery Scores (needs all other data first)
    for i in range(num_days):
        # Normalize HRV (higher is better for recovery)
        norm_hrv = (hrv_values[i] - HRV_MIN) / (HRV_MAX - HRV_MIN)
        norm_hrv = np.clip(norm_hrv, 0, 1)

        # Normalize RHR (lower is better for recovery)
        norm_rhr = 1 - ((rhr_values[i] - RHR_MIN) / (RHR_MAX - RHR_MIN))
        norm_rhr = np.clip(norm_rhr, 0, 1)

        # Calculate Sleep Quality Score (0-1)
        norm_sleep_duration = (sleep_duration_hours_values[i] - SLEEP_DURATION_MIN_HOURS) / \
                              (SLEEP_DURATION_MAX_HOURS - SLEEP_DURATION_MIN_HOURS)
        norm_sleep_duration = np.clip(norm_sleep_duration, 0, 1)
        
        norm_sleep_efficiency = (sleep_efficiency_percent_values[i] - SLEEP_EFFICIENCY_MIN_PERCENT) / \
                                (SLEEP_EFFICIENCY_MAX_PERCENT - SLEEP_EFFICIENCY_MIN_PERCENT)
        norm_sleep_efficiency = np.clip(norm_sleep_efficiency, 0, 1)
        
        sleep_quality_score = (SLEEP_DURATION_WEIGHT_IN_QUALITY * norm_sleep_duration) + \
                              (SLEEP_EFFICIENCY_WEIGHT_IN_QUALITY * norm_sleep_efficiency)
        sleep_quality_score = np.clip(sleep_quality_score, 0, 1)

        # Normalize Previous Day's Strain (lower is better for recovery)
        if i == 0:
            prev_strain = ASSUMED_PREV_DAY_STRAIN_FOR_DAY_0
        else:
            prev_strain = strain_score_values[i-1]
        
        norm_prev_strain = 1 - ((prev_strain - OVERALL_STRAIN_MIN_FOR_RECOVERY_NORMALIZATION) / \
                                (OVERALL_STRAIN_MAX_FOR_RECOVERY_NORMALIZATION - OVERALL_STRAIN_MIN_FOR_RECOVERY_NORMALIZATION))
        norm_prev_strain = np.clip(norm_prev_strain, 0, 1)

        # Calculate final recovery score
        recovery_score = (
            RECOVERY_HRV_WEIGHT * norm_hrv +
            RECOVERY_RHR_WEIGHT * norm_rhr +
            RECOVERY_SLEEP_QUALITY_WEIGHT * sleep_quality_score +
            RECOVERY_PREV_STRAIN_WEIGHT * norm_prev_strain
        ) * 100
        recovery_score = np.clip(recovery_score, 0, 100)
        recovery_score_percent_values.append(round(recovery_score))
        
    df = pd.DataFrame({
        'date': dates,
        'hrv': hrv_values,
        'rhr': rhr_values,
        'sleep_duration_hours': sleep_duration_hours_values,
        'sleep_efficiency_percent': sleep_efficiency_percent_values,
        'sleep_rem_hours': sleep_rem_hours_values,
        'sleep_deep_hours': sleep_deep_hours_values,
        'sleep_light_hours': sleep_light_hours_values,
        'strain_score': strain_score_values,
        'recovery_score_percent': recovery_score_percent_values
    })
    
    return df

# --- Validation Function ---
def validate_generated_data(df: pd.DataFrame) -> list[str]:
    """Validates the generated data for plausible ranges and consistency."""
    warnings = []
    for index, row in df.iterrows():
        # Range checks
        if not (HRV_MIN <= row['hrv'] <= HRV_MAX):
            warnings.append(f"Day {row['date'].strftime('%Y-%m-%d')}: HRV {row['hrv']} out of range [{HRV_MIN}-{HRV_MAX}]")
        if not (RHR_MIN <= row['rhr'] <= RHR_MAX):
            warnings.append(f"Day {row['date'].strftime('%Y-%m-%d')}: RHR {row['rhr']} out of range [{RHR_MIN}-{RHR_MAX}]")
        if not (1 <= row['sleep_duration_hours'] <= 14): # Generous range for sleep
            warnings.append(f"Day {row['date'].strftime('%Y-%m-%d')}: Sleep duration {row['sleep_duration_hours']} out of range [1-14] hours")
        if not (0 <= row['sleep_efficiency_percent'] <= 100):
            warnings.append(f"Day {row['date'].strftime('%Y-%m-%d')}: Sleep efficiency {row['sleep_efficiency_percent']} out of range [0-100]%")
        if not (0 <= row['recovery_score_percent'] <= 100):
            warnings.append(f"Day {row['date'].strftime('%Y-%m-%d')}: Recovery score {row['recovery_score_percent']} out of range [0-100]%")
        if not (0 <= row['strain_score'] <= 21):
            warnings.append(f"Day {row['date'].strftime('%Y-%m-%d')}: Strain score {row['strain_score']} out of range [0-21]")

        # Sleep stages sum check
        effective_sleep_hours_for_row = round(row['sleep_duration_hours'] * (row['sleep_efficiency_percent'] / 100.0), 2)
        sleep_stages_sum = row['sleep_rem_hours'] + row['sleep_deep_hours'] + row['sleep_light_hours']
        # Increased atol to 0.03 to account for potential compounded rounding errors from multiple sources
        # (duration, efficiency, and 3 sleep stages all being rounded independently)
        if not np.isclose(sleep_stages_sum, effective_sleep_hours_for_row, atol=0.03):
            warnings.append(f"Day {row['date'].strftime('%Y-%m-%d')}: Sum of sleep stages ({sleep_stages_sum:.2f}) does not match effective sleep duration ({effective_sleep_hours_for_row:.2f}), diff: {abs(sleep_stages_sum - effective_sleep_hours_for_row):.3f}")
    return warnings

# --- Query Utility Functions ---
def get_metric_for_date(df: pd.DataFrame, date_str: str, metric_name: str) -> float | None:
    """Retrieves a specific metric for a given date string (YYYY-MM-DD)."""
    if metric_name not in df.columns:
        print(f"Error: Metric '{metric_name}' not found in DataFrame columns.")
        return None
    # Ensure the 'date' column is in datetime objects if it's not already
    # This check is important if the function is called with a df where 'date' might not be converted yet
    if not pd.api.types.is_datetime64_any_dtype(df['date']):
        # It's generally better to ensure conversion happens before calling this function,
        # but this provides a fallback. Modifying df in place might be unexpected for caller.
        # Consider df = df.copy() if modification is needed and df might be reused.
        # For this script's flow, direct conversion in __main__ is preferred.
        pass # Assume date is pre-converted as per __main__ block's logic

    target_date = pd.to_datetime(date_str).date()
    # Use .dt.date for comparison if df['date'] contains datetime objects
    metric_value = df[df['date'].dt.date == target_date][metric_name]
    if not metric_value.empty:
        return metric_value.iloc[0]
    return None

def get_last_n_days_average(df: pd.DataFrame, metric_name: str, n_days: int) -> float | None:
    """Calculates the average of a specific metric over the last n_days available."""
    if metric_name not in df.columns:
        print(f"Error: Metric '{metric_name}' not found in DataFrame columns.")
        return None
    if n_days <= 0:
        print("Error: n_days must be positive.")
        return None
    if len(df) < n_days:
        # print(f"Warning: DataFrame has less than {n_days} days. Averaging over available {len(df)} days.")
        return df[metric_name].mean() # Average over all available if less than n_days
    return df[metric_name].tail(n_days).mean()

def get_yesterdays_metric(df: pd.DataFrame, metric_name: str) -> float | None:
    """Retrieves a specific metric for the most recent day in the DataFrame."""
    if metric_name not in df.columns:
        print(f"Error: Metric '{metric_name}' not found in DataFrame columns.")
        return None
    if df.empty:
        return None
    return df[metric_name].iloc[-1]

if __name__ == "__main__":
    daily_metrics_data = generate_daily_metrics(NUM_DAYS, START_DATE)
    # Ensure the 'date' column is converted to datetime objects for consistent use
    daily_metrics_data['date'] = pd.to_datetime(daily_metrics_data['date'])
    print("\nGenerated Daily Metrics Data (first 5 and last 5 days):")
    pd.set_option('display.max_columns', None)
    pd.set_option('display.width', 1000)
    print(daily_metrics_data.head())
    print("...")
    print(daily_metrics_data.tail())

    # Example usage of query utilities
    print("\n--- Query Utilities Examples ---")
    yesterday_hrv = get_yesterdays_metric(daily_metrics_data, 'hrv')
    print(f"Yesterday's HRV: {yesterday_hrv}")

    last_7_days_avg_recovery = get_last_n_days_average(daily_metrics_data, 'recovery_score_percent', 7)
    print(f"Last 7 days average recovery: {last_7_days_avg_recovery:.2f}%")

    # Example: Get sleep duration for a specific date (e.g., 10 days before the end date)
    specific_date_to_query = (END_DATE - datetime.timedelta(days=10)).strftime('%Y-%m-%d')
    sleep_on_specific_date = get_metric_for_date(daily_metrics_data, specific_date_to_query, 'sleep_duration_hours')
    print(f"Sleep duration on {specific_date_to_query}: {sleep_on_specific_date} hours")

    # Example: Get a metric for a date that might not exist
    non_existent_date = (END_DATE + datetime.timedelta(days=5)).strftime('%Y-%m-%d')
    metric_non_existent = get_metric_for_date(daily_metrics_data, non_existent_date, 'hrv')
    print(f"HRV on {non_existent_date}: {metric_non_existent}")

    # Validate the generated data
    print("\n--- Data Validation --- ")
    validation_warnings = validate_generated_data(daily_metrics_data)
    if validation_warnings:
        print("Validation Warnings Found:")
        for warning in validation_warnings:
            print(f"- {warning}")
    else:
        print("All data validation checks passed.")

    # --- Save to JSON ---
    print(f"\n--- Saving Data to JSON ---")
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        print(f"Created directory: {OUTPUT_DIR}")

    df_to_export = daily_metrics_data.copy()

    # Ensure date is in 'YYYY-MM-DD' string format for JSON
    if pd.api.types.is_datetime64_any_dtype(df_to_export['date']):
        df_to_export['date'] = df_to_export['date'].dt.strftime('%Y-%m-%d')

    # Explicitly round float columns to desired precision for consistent JSON output
    # (though they are already rounded when added to lists, this is a safeguard)
    df_to_export['sleep_duration_hours'] = df_to_export['sleep_duration_hours'].round(2)
    df_to_export['sleep_efficiency_percent'] = df_to_export['sleep_efficiency_percent'].round(1)
    df_to_export['sleep_rem_hours'] = df_to_export['sleep_rem_hours'].round(2)
    df_to_export['sleep_deep_hours'] = df_to_export['sleep_deep_hours'].round(2)
    df_to_export['sleep_light_hours'] = df_to_export['sleep_light_hours'].round(2)
    df_to_export['strain_score'] = df_to_export['strain_score'].round(1)
    # Integer columns (hrv, rhr, recovery_score_percent) are already integers.

    try:
        df_to_export.to_json(OUTPUT_FILE_PATH, orient="records", indent=2)
        print(f"Synthetic data successfully saved to: {OUTPUT_FILE_PATH}")
    except Exception as e:
        print(f"Error saving data to JSON: {e}")

    # --- Test Loading JSON Data ---
    print(f"\n--- Testing Loading Saved JSON Data ---")
    try:
        loaded_df = pd.read_json(OUTPUT_FILE_PATH)
        # Convert date column back to datetime objects if needed for further processing/display
        # loaded_df['date'] = pd.to_datetime(loaded_df['date'])
        print(f"Successfully loaded data from {OUTPUT_FILE_PATH}")
        print("First 5 rows of loaded data:")
        print(loaded_df.head())
    except Exception as e:
        print(f"Error loading data from JSON: {e}")

    # print(f"Sleep Efficiency stats: Mean={daily_metrics_data['sleep_efficiency_percent'].mean():.1f}%, Min={daily_metrics_data['sleep_efficiency_percent'].min()}%, Max={daily_metrics_data['sleep_efficiency_percent'].max()}%" )
