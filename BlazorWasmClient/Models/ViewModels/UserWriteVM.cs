namespace BlazorWasmClient.Models.ViewModels
{
    public class UserWriteVM
    {
        public string Username { get; set; }
        public string Password { get; set; }
        public bool Active { get; set; }
        public List<string> Roles { get; set;}
    }
}
