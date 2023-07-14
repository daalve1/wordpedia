<script>
    import confetti from "canvas-confetti"

    let words = []
    let wordsTable = []
    let definitions = []
    let correctsRow = []

    let incorrectRow = -1
    let selectedRow = -1
    let finished = false
    let fetchWordsDefinitions = null

    const acentos = {
        'á': 'a',
        'é': 'e',
        'í': 'i',
        'ó': 'o',
        'ú': 'u',
        'Á': 'A',
        'É': 'E',
        'Í': 'I',
        'Ó': 'O',
        'Ú': 'U'
    }

    // Función para obtener palabras con sus definiciones
    async function getWordsWithDefinitions() {
        // Procesar la respuesta y extraer las palabras y definiciones
        const regex = /\d+\.\s*([^:]+):\s*([^0-9]+)/g;
        const wordsWithDefinitions = [];

        let match
        let response = await fetch('/api/wordGenerator')
        let completion = await response.json()

        while ((match = regex.exec(completion)) !== null) {
            const word = match[1]
            const definition = match[2]

            wordsWithDefinitions.push({ word, definition });
        }

        return wordsWithDefinitions
    }

    // Oculta las letras para mostrarlo al usuario
    function hiddenLetters(word) {
        const rand = Math.floor(Math.random() * word.length)
        
        let wordAux = word.map((letter, index) => {
            if(index !== rand) {
                return ""
            } else {
                return letter
            }
        })

        return wordAux
    }

    // Reinializa las variables del juego
    function refresh() {
        words = []
        wordsTable = []
        definitions = []
        finished = false
        correctsRow = []

        start()
    }

    // Reinicializa las palabras/definiciones del juego
    function start() {
        fetchWordsDefinitions = getWordsWithDefinitions()

        fetchWordsDefinitions.then(wordsWithDefinitions => {
            wordsWithDefinitions.forEach(wordWithDefinition => {
                words.push([...eliminaAcentos(wordWithDefinition.word.toUpperCase())])
                wordsTable.push(hiddenLetters([...eliminaAcentos(wordWithDefinition.word.toUpperCase())]))
                definitions.push(wordWithDefinition.definition)
            })
        })
        .catch(error => {
            console.error('Error al obtener palabras con definiciones:', error)
        })
    }

    // Muestra la definición de la palabra seleccionada
    function showDefinition(row) {
        selectedRow = row
        nextEmptyField(row)
    }

    // Bloquea la edición de una palabra porque es correcta
    function disableWord(row) {
        // Si la palabra no había sido añadida al listado de correctas, se añade
        if(!correctsRow.includes(row)) {
            correctsRow.push(row)
        }

        // Deshabilitamos las letras de la palabra correcta
        for(let i=0; i<words[row].length; i++) {
            let el = document.getElementById("r"+row+"c"+i)

            el.setAttribute("readonly", true)
            el.classList.add("notempty")
        }

        let ended = checkEndGame()
        
        if(!ended) {
            if(row+1 < words[row].length) {
                nextEmptyField(row+1, 0)
                selectedRow = row+1
            }
        }
    }

    // Pinta palabra como incorrecta
    function incorrect(row) {
        let elems = document.getElementsByClassName("r"+row)
        incorrectRow = row

        setTimeout(function() {
            incorrectRow = -1

            for (let i = 0; i < elems.length; i++) {
                let el = elems[i]
                el.value = wordsTable[row][i]
                
                if(i == 0) elems[0].focus()
            }
        }, 1000)
    }

    // Mueve el foco a la siguiente casilla vacia de una palabra dada
    function nextEmptyField(row, col) {
        let isCorrect = checkCorrectWord(row)

        if(isCorrect) return

        let el

        for(let i=col; i<words[row].length; i++) {
            el = document.getElementById("r"+row+"c"+i)
            
            if("" === el.value) {
                el.focus()
                break
            }  
        }
    }

    // Función que captura el evento keydown y comprueba que sea la tecla de borrado
    function onKeyDown(ev) {
        if("Backspace" === ev.key) {
            const regex = /\d+/g;
            let id = ev.target.id
            let match = id.match(regex)

            let row = match[0]
            let col = match[1]

            deleteLetter(row, col)
        }
    }

    // Elimina la letra que haya en el campo actual o en su defecto en la casia previa
    function deleteLetter(row, col) {
        let el = document.getElementById(`r${row}c${col}`)
        if(!el.classList.contains("notempty") && el.value !== "") {
            el.value = ''

            return
        }

        for(let i=(col-1); i>=0; i--) {
            let el = document.getElementById(`r${row}c${i}`)

            if(el.classList.contains("notempty")) continue

            el.value = ''
            el.focus()

            break
        }
    }

    // Comprueba si la palabra es correcta
    function checkCorrectWord(row) {        
        let elems = document.getElementsByClassName('r'+row)

        let values = [...elems].map(el => {
            return el.value || ""
        })

        let w = words[row].toString().replaceAll(",","").toUpperCase()
        let v = values.toString().replaceAll(",", "").toUpperCase()
        
        if(w.length > v.length) {
            return false
        } else {
            if(w === v) {
                disableWord(row)
                return true
            } else {
                incorrect(row)
                return false
            }
        }
    }

    // Comprueba si se ha terminado el juego
    function checkEndGame() {
        let f = correctsRow.length === words.length

        if(f) {
            setTimeout(function() {
                getConfetti()
            }, 400)

            setTimeout(function() {
                finished = f
            }, 1500)
        }

        return f
    }

    function getConfetti() {
        var count = 200;
        var defaults = {
            origin: { y: 0.7 }
        }

        function fire(particleRatio, opts) {
            confetti(Object.assign({}, defaults, opts, {
                particleCount: Math.floor(count * particleRatio)
            }))
        }

        fire(0.25, {
            spread: 26,
            startVelocity: 55,
        })
        fire(0.2, {
            spread: 60,
        })
        fire(0.35, {
            spread: 100,
            decay: 0.91,
            scalar: 0.8
        })
        fire(0.1, {
            spread: 120,
            startVelocity: 25,
            decay: 0.92,
            scalar: 1.2
        })
        fire(0.1, {
            spread: 120,
            startVelocity: 45,
        })
    }

    function eliminaAcentos(cadena) {
        return cadena.replace(/[áéíóúÁÉÍÓÚ]/g, letra => acentos[letra]);
    }
</script>

<h1>WordPedia</h1>

{#if !finished}
    {#if null != fetchWordsDefinitions}
        {#await fetchWordsDefinitions}
            <p>Cargando...</p>
        {:then data}
            {#each wordsTable as word, row} 
                <div class="word" on:click={() => showDefinition(row)}>
                    {#each word as letter, col}
                        <div class="letter">
                            <input id="r{row}c{col}"
                                type="text" 
                                value={letter} 
                                class={letter === "" ? 'r'+row : 'r'+row + ' notempty'}
                                class:incorrect={row == incorrectRow}
                                class:correct={correctsRow.includes(row)}
                                class:selected={row == selectedRow}
                                maxlength="1"
                                readonly={letter !== ""}
                                autocomplete="off"
                                on:input={() => nextEmptyField(row, col)}
                                on:keydown={onKeyDown}>
                        </div>
                    {/each}
                </div>
            {/each}
            <div id="definitions">
                {#each definitions as definition, i} 
                    <p id="def{i}" class:selectedDefinition={i == selectedRow}> {definition}</p>
                {/each}
            </div>

            <button on:click={() => refresh()} class="reset">rerun</button>
        {:catch error}
            <p>An error occurred! {error}</p>
            <button on:click={() => refresh()} class="reset">rerun</button>
        {/await}
    {:else}
        <button on:click={() => {start()}}>START</button>
    {/if}
{:else}
    <h1>FINISHED</h1>
    <button on:click={() => refresh()} class="reset">rerun</button>
{/if}

<style>
    h1 {
        text-align: center;
    }

    #definitions p {
        display: none;
        text-align: center;
        width: 80%;
        margin: 2em auto 3em;
    }

    .definition {
        display: none;
    }

    .selectedDefinition {
        display: block !important;
    }

    .word {
        display: flex;
        align-items: center;
        justify-content: center;
    }

    .letter, input {
        width: 24px;
        height: 24px;
    }

    .letter {
        display: flex;
        align-items: center;
        justify-content: center;
        display: inline-block;
        margin: 12px;
    }

    input {
        text-align: center; 
        text-transform: uppercase;
        outline: none;
        border: 2px solid #353535;
        border-radius: 6px;
        cursor: pointer;
    }

    .notempty, .correct {
        background: greenyellow;
    }

    .default {
        background: white;
    }

    .incorrect {
        background: red !important;
    }

    .selected {
        border: 2px solid #3C6E71;
    }

    button {
        display: block;
        margin: 1em auto;
        padding: 20px 62px;
        text-transform: uppercase;
        background-color: #353535;
        color: white;
        border: 1px solid #3C6E71;
        border-radius: 6px;
        cursor: pointer;
    }

    button:hover {
        background-color: #3C6E71;
        color: white;
        border: 1px solid #353535;
    }

    h1 {
        text-transform: uppercase;
        color: #353535;
    }
</style>