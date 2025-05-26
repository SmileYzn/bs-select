document.addEventListener('DOMContentLoaded', function()
{
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Estado / Cidades
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const selectEstado = document.querySelector('select[name="estadoFK"]');
    const selectCidade = document.querySelector('select[name="cidadeFK"]');
    //
    if(selectEstado && selectCidade)
    {
        const opcoes =
        {
            lang:
            {
                noResults: 'Nenhum resultado',
                placeholder: 'Selecione uma opção',
            }
        };
        
        new bsSelect(selectEstado, opcoes);
        
        selectEstado.addEventListener('change', () =>
        {
            console.log(selectEstado); 
        });
    }
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // API CEP (VIACEP)
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    const buttonViaCep = document.getElementById('consulta-cep-viacep');
    //
    if (buttonViaCep)
    {
        const inputViaCep = document.querySelector('input[name="cep"]');
        
        if (inputViaCep)
        {
            buttonViaCep.addEventListener('click', () =>
            {
                const cep = inputViaCep.value.replace(/\D/g, '');
                // 
                if(cep.length === 8)
                {
                    fetch('https://viacep.com.br/ws/' + cep + '/json/').then(viacep => viacep.json()).then((viacep) =>
                    {
                        if (!('erro' in viacep))
                        {
                            selectEstado.value = viacep.ibge.substring(0, 2);
                            selectEstado.dispatchEvent(new CustomEvent('change', {detail: viacep}));
                            //
                            selectCidade.value = viacep.ibge;
                            //
                            if (viacep.bairro)
                            {
                                document.querySelector('input[name="bairro"]').value = viacep.bairro;
                            }
                            //
                            if (viacep.logradouro)
                            {
                                document.querySelector('input[name="logradouro"]').value = viacep.logradouro;
                            }
                            //
                            if (viacep.complemento)
                            {
                                document.querySelector('input[name="complemento"]').value = viacep.complemento;
                            }
                        }
                        else
                        {
                            alert('CEP ' + cep + ' não encontrado.');
                        }
                    });
                }
                else
                {
                    alert('O CEP ' + cep + ' não é válido.');
                }
            });
        }
    }
});
