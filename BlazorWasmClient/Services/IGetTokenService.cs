namespace BlazorWasmClient.Services
{
    public interface IGetTokenService
    {
        Task<bool> GetToken(string username, string password);
    }
}
