namespace BlazorWasmClient.Models.ViewModels
{
    public class RoleGetModel
    {
        public int Id { get; set; }
        public string Name { get; set; }
        public string Description { get; set; }
        public bool Active { get; set; }
        public DateTime Created_At { get; set; }
        public DateTime Updated_At { get; set; }
        public List<string> Permissions { get; set; }
    }
}
