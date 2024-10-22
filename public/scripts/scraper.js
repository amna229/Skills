URL = `https://tinkererway.dev/web_skill_trees/electronics_skill_tree`;

let datosPorId = fetch(`https://tinkererway.dev/web_skill_trees/electronics_skill_tree?{$id}`)
    .then(r => r.json())
    .then(data => {
        console.log(data);
    });

let datosPorCompetencia = fetch(`https://tinkererway.dev/web_skill_trees/electronics_skill_tree?{$competencia}`)
    .then(r => r.json())
    .then(data => {
        console.log(data);
    });

