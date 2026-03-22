import pandas as pd
import json

# Load CSVs
players_df = pd.read_csv('MoreSidemen Among Us.xlsx - Player Stats.csv').fillna('NA')
kills_df = pd.read_csv('MoreSidemen Among Us.xlsx - Kill Permutations.csv').fillna('NA')
combos_df = pd.read_csv('MoreSidemen Among Us.xlsx - Imposter Combinations.csv').fillna('NA')

# Process Kill Permutations
kills_by_player = {} # Who this player kills the most
killed_by_player = {} # Who kills this player the most

for _, row in kills_df.iterrows():
    killer = row['Primary Player']
    target = row['Target']
    count = int(row['Kill Count'])
    
    if killer not in kills_by_player: kills_by_player[killer] = []
    kills_by_player[killer].append({"name": target, "count": count})
    
    if target not in killed_by_player: killed_by_player[target] = []
    killed_by_player[target].append({"name": killer, "count": count})

# Process Imposter Combinations (Top 10 combinations by games played)
combos_list = []
for _, row in combos_df.iterrows():
    if row['Number of Games'] != 'NA' and int(row['Number of Games']) >= 4:
        combos_list.append({
            "combo": row['Imposter Combination'],
            "games": int(row['Number of Games']),
            "wins": int(row['Wins']),
            "winRate": float(row['Win %'])
        })
combos_list = sorted(combos_list, key=lambda x: x['games'], reverse=True)[:10]

# Process Players
players_data = []
for index, row in players_df.iterrows():
    if str(row['Games Played']) == 'NA' or int(row['Games Played']) < 5:
        continue
        
    p_name = row['Name']
    
    # Get top 3 victims & nemeses
    victims = sorted(kills_by_player.get(p_name, []), key=lambda x: x['count'], reverse=True)[:3]
    nemeses = sorted(killed_by_player.get(p_name, []), key=lambda x: x['count'], reverse=True)[:3]
        
    player = {
        "id": p_name,
        "name": p_name,
        "icon": "🧑‍🚀",
        "winRate": float(row['Win %']) if row['Win %'] != 'NA' else 0,
        "games": int(row['Games Played']),
        "stats": {
            "wins": int(row['Wins']),
            "losses": int(row['Losses']),
            "kills": int(row['Kills']),
            "deaths": int(row['Deaths']),
            "kdr": float(row['KDR']) if row['KDR'] != 'NA' else 0,
            "tasksCompleted": int(row['Tasks Completed']) if row['Tasks Completed'] != 'NA' else 0,
            "votedOut": int(row['Voted out']) if row['Voted out'] != 'NA' else 0,
            "meetings": int(row['Emergency Meetings']) if row['Emergency Meetings'] != 'NA' else 0
        },
        "roles": {
            "Crewmate": {
                "games": int(row['Crewmate Games']) if row['Crewmate Games'] != 'NA' else 0,
                "wins": int(row['Crewmate Wins']) if row['Crewmate Wins'] != 'NA' else 0,
                "winRate": float(row['Crewmate Win %']) if row['Crewmate Win %'] != 'NA' else 0
            },
            "Imposter": {
                "games": int(row['Imposter Games']) if row['Imposter Games'] != 'NA' else 0,
                "wins": int(row['Imposter Wins']) if row['Imposter Wins'] != 'NA' else 0,
                "winRate": float(row['Imposter Win %']) if row['Imposter Win %'] != 'NA' else 0,
                "kills": int(row['Kills as Imposter']) if row['Kills as Imposter'] != 'NA' else 0
            }
        },
        "trivia": {
            "topVictims": victims,
            "topNemeses": nemeses
        }
    }
    players_data.append(player)

players_data = sorted(players_data, key=lambda x: x['games'], reverse=True)

final_data = {
    "overall": {
        "totalGames": 435,
        "totalKills": 2051,
        "totalTasks": 16878,
        "completedTasks": 6390,
        "topCombos": combos_list
    },
    "players": players_data
}

with open('stats.json', 'w') as f:
    json.dump(final_data, f, indent=2)

print("Updated stats.json generated successfully!")