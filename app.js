
	var app = angular.module('Trabformais',[]);
	
	app.controller('FormaisController', function(){
			
			
		this.terminais = 'a,b,&';
		this.naoTerminais = 'A,B,S';		
		this.simboloProducao = 'P';
		this.simboloInicioProducao = 'S';
		this.conjuntoProducoes = 'S->AB|A|B\nA->a|Aa|&\nB->b|Bb';;
		
		this.listaTerminais = [];
		this.listaNaoTerminais = [];
		
		this.producoes = [];
		
		this.listaFirstDeNaoTerminal = [];
		this.listaFollowDeNaoTerminal = [];
	
		var formaisController = this;
		
		this.caractereSentencaVazia = '&';
		
		this.gerarSentencas = function(){
			this.listaTerminais = [];
			this.producoes = [];
			this.listaFirstDeNaoTerminal = [];
			this.listaFollowDeNaoTerminal = [];
			this.listaNaoTerminais = [];
			
			this.listaTerminais = this.terminais.split(",");			
			this.listaNaoTerminais = this.naoTerminais.split(",");
			
			this.listaLadoEsquerdoConjuntoProducao = [];
			
			
			this.gerarListaConjuntoProducoes();
			
		};
		
		this.gerarListaConjuntoProducoes = function(){
		
			// Separacao das linhas das producoes
			var listaDeLinhasDasProducoes = this.separarLinhasDasProducoes();
			console.log(listaDeLinhasDasProducoes);			
			
			for (i = 0; i < listaDeLinhasDasProducoes.length; i++) {
				console.log( listaDeLinhasDasProducoes[i] );
						
				if( listaDeLinhasDasProducoes[i].indexOf( '->' ) != -1 ){
					this.separarConjuntoDeSentencasParaladoEsquerdo( listaDeLinhasDasProducoes[i].slice(0,listaDeLinhasDasProducoes[i].indexOf('->')), listaDeLinhasDasProducoes[i].slice(listaDeLinhasDasProducoes[i].indexOf('->')+2,listaDeLinhasDasProducoes[i].length) );
				}			
			}
			
			// Iteracao sobre a lista de NT, busca o FIRST, se conter vazio, gera o follow
			for (i = 0; i < this.listaNaoTerminais.length; i++) {
				
				if( this.isGramaticaLL1() ){
			
					var naoTerminalAtual = this.listaNaoTerminais[i];
					this.getFirst( naoTerminalAtual );
					// Verifica se dentre a lista de first se tem sentenca vazia
					if( this.listaFirstDeNaoTerminal[naoTerminalAtual].indexOf( this.caractereSentencaVazia ) > -1 ){				
						this.getFollow( naoTerminalAtual );
					}
					
					this.gerarTabelaPreditiva();			
				}
			}		
			
			console.log('TODAS PRODUCOES ');
			console.log(this.producoes);
			console.log('lista FIRST ');
			console.log(this.listaFirstDeNaoTerminal);
			console.log('lista FOLLOW ');
			console.log(this.listaFollowDeNaoTerminal);		
		}
		
		
		this.separarLinhasDasProducoes = function(){
		
			var listaDeLinhasDasProducoes = this.conjuntoProducoes.split('\n');
			
			index = listaDeLinhasDasProducoes.indexOf("{");
			if (index > -1) {
				listaDeLinhasDasProducoes.splice(index, 1);
			}
			
			index = listaDeLinhasDasProducoes.indexOf("}");
			if (index > -1) {
				listaDeLinhasDasProducoes.splice(index, 1);
			}
			
			return listaDeLinhasDasProducoes;
		}
		
		this.separarConjuntoDeSentencasParaladoEsquerdo = function( valorladoEsquerdo, valorProducoes ){	
				
			formaisController.producoes[valorladoEsquerdo] = valorProducoes.split("|");
			
			console.log( formaisController.producoes[valorladoEsquerdo] );
		}
		
		this.isGramaticaLL1	 = function(){
			return true;
		}

		this.getFirst = function( naoTerminal ){
			
			// Inicializa lista de first do NT
			if( formaisController.listaFirstDeNaoTerminal[naoTerminal] == null ){
				formaisController.listaFirstDeNaoTerminal[naoTerminal] = [];
			}
			
			// Itera sobre as producoes do NT
			for (var x = 0; x < formaisController.producoes[naoTerminal].length; x++) {
				
				var producaoDoNaoTerminal = formaisController.producoes[naoTerminal][x];			
				
				// Verifica se o primeiro caractere esta na lista de teminais ou é vazio
				if( formaisController.listaTerminais.indexOf( producaoDoNaoTerminal[0] ) > -1 ||
					 producaoDoNaoTerminal[0] == formaisController.caractereSentencaVazia
				){
					
					// Adiciona na lista de first do NT
					formaisController.listaFirstDeNaoTerminal[naoTerminal].push( producaoDoNaoTerminal[0] );
					
				// Como o primeiro caractere é um NT, verifica se o NT nao eh o mesmo que se esta criando o FIRST
				}else if( naoTerminal != producaoDoNaoTerminal[0] ){
					
					// Se ainda nao foi criada a lista FIRST daquele NT
					if( formaisController.listaFirstDeNaoTerminal[ producaoDoNaoTerminal[0] ] == null ){
						this.getFirst( producaoDoNaoTerminal[0] );
					}
						
					// Concatena na lista FIRST
					formaisController.listaFirstDeNaoTerminal[naoTerminal] = formaisController.listaFirstDeNaoTerminal[naoTerminal].concat( formaisController.listaFirstDeNaoTerminal[ producaoDoNaoTerminal[0] ] );					
				}
			}
			
			// Retorna somente os itens unicos do array, remove valores duplicados
			formaisController.listaFirstDeNaoTerminal[naoTerminal] = this.retornarSomenteItensUnicosDeArray(formaisController.listaFirstDeNaoTerminal[naoTerminal]);
		}
		
		this.getFollow = function( naoTerminal ){
			
			// Inicializa lista de follow do NT
			if( formaisController.listaFollowDeNaoTerminal[naoTerminal] == null ){
				formaisController.listaFollowDeNaoTerminal[naoTerminal] = [];
				
				// Se for simbolo de inicio de producao, adicionar final de producao
				if( naoTerminal == formaisController.simboloInicioProducao ){
					formaisController.listaFollowDeNaoTerminal[naoTerminal].push( '$' );
				}
			}
			
			// Itera sobre todos NT
			for (var y = 0; y < formaisController.listaNaoTerminais.length; y++) {
				
				var naoTerminalAtual = formaisController.listaNaoTerminais[y];
				// Itera sobre as producoes do NT
				for (var x = 0; x < formaisController.producoes[ naoTerminalAtual ].length; x++) {
					
					var producaoDoNaoTerminalAtual = formaisController.producoes[ naoTerminalAtual ][x];
					
					// Se existir na producao o NT
					var posicaoDoNaoTerminalNaProducao = producaoDoNaoTerminalAtual.indexOf(naoTerminal);
					if( posicaoDoNaoTerminalNaProducao > -1 ){
						
						var proximoCaractereDoNaoTerminal = producaoDoNaoTerminalAtual.charAt( posicaoDoNaoTerminalNaProducao+1 );
						
						// Se nao existir proximo caractere, deve buscar o FOLLOW do NTAtual
						if( proximoCaractereDoNaoTerminal.length == 0 ){
							this.getFollow( naoTerminalAtual );
							formaisController.listaFollowDeNaoTerminal[naoTerminal] = formaisController.listaFollowDeNaoTerminal[naoTerminal].concat( formaisController.listaFollowDeNaoTerminal[ naoTerminalAtual ] );
							
						// Caso o proximo caractere for um terminal, só adiciona a lista
						}else if( formaisController.listaTerminais.indexOf( proximoCaractereDoNaoTerminal ) > -1 ){
							formaisController.listaFollowDeNaoTerminal[naoTerminal].push( proximoCaractereDoNaoTerminal );
							
						// Caso o proximo caractere for um NT, é buscado o FIRST do mesmo
						}else{
							// Se ainda nao tiver sido feita a lista de FIRST do proximo caractere, a mesma é montada
							if( formaisController.listaFirstDeNaoTerminal[ proximoCaractereDoNaoTerminal ] == null ){
								this.getFirst( proximoCaractereDoNaoTerminal );
							}
							formaisController.listaFollowDeNaoTerminal[naoTerminal] = formaisController.listaFollowDeNaoTerminal[naoTerminal].concat( formaisController.listaFirstDeNaoTerminal[ proximoCaractereDoNaoTerminal ] );							
						}
					}				
				}			
			}
			
			// Retorna somente os itens unicos do array, remove valores duplicados
			formaisController.listaFollowDeNaoTerminal[naoTerminal] = this.retornarSomenteItensUnicosDeArray(formaisController.listaFollowDeNaoTerminal[naoTerminal]);
			formaisController.listaFollowDeNaoTerminal[naoTerminal] = this.removerCaractereDeArray( formaisController.listaFollowDeNaoTerminal[naoTerminal], formaisController.caractereSentencaVazia );
		}
		
		this.gerarTabelaPreditiva = function(){
			return null;
		}
		
		this.retornarSomenteItensUnicosDeArray = function(a){
			var seen = {};
			var out = [];
			var len = a.length;
			var j = 0;
			for(var i = 0; i < len; i++) {
				 var item = a[i];
				 if(seen[item] !== 1) {
					   seen[item] = 1;
					   out[j++] = item;
				 }
			}
			return out;
		}
		
		this.removerCaractereDeArray = function(array, caractere){
			var index = array.indexOf(caractere);
			if (index > -1) {
				array.splice(index, 1);
			}
			
			return array;
		}
	});
