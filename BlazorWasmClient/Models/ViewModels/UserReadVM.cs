namespace BlazorWasmClient.Models.ViewModels
{
    public class UserReadVM
    {
        public int Id { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public bool Active { get; set; }
        public DateTime Created_At { get; set; }
        public DateTime Updated_At { get; set; }
        public string Roles { get; set; }
    }
}
